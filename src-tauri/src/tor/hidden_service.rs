use crate::tor::TorClientManager;
use anyhow::{Context, Result};
use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;
use tor_hsrproxy::config::{
    Encapsulation, ProxyAction, ProxyConfigBuilder, ProxyPattern, ProxyRule, TargetAddr,
};
use tor_hsrproxy::OnionServiceReverseProxy;
use tor_hsservice::config::OnionServiceConfigBuilder;
use tor_hsservice::{HsNickname, RunningOnionService};
use tracing::{error, info};

/// manages an Arti-based hidden service
pub struct HiddenServiceManager {
    onion_service: Option<Arc<RunningOnionService>>,
    onion_address: Option<String>,
    proxy_handle: Option<tokio::task::JoinHandle<()>>,
}

/// configuration for hidden service
#[derive(Clone, Debug)]
#[allow(dead_code)]
pub struct HiddenServiceConfig {
    /// Directory to store Tor configuration and state
    pub tor_data_dir: PathBuf,
    /// local port to forward to (e.g., Ghost port)
    pub local_port: u16,
    /// port to expose on the .onion address
    pub onion_port: u16,
}

impl HiddenServiceManager {
    /// create a new hidden service manager
    pub fn new(_config: HiddenServiceConfig) -> Result<Self> {
        Ok(Self {
            onion_service: None,
            onion_address: None,
            proxy_handle: None,
        })
    }

    /// start the hidden service using Arti
    pub async fn start(
        &mut self,
        tor_manager: Arc<TorClientManager>,
        local_proxy_port: u16, // Changed: this is now the LOCAL proxy port
        onion_port: u16,
    ) -> Result<()> {
        info!("starting Arti-based hidden service...");

        // create a unique nickname for this hidden service
        let nickname: HsNickname = "ghost_freedom_hs"
            .to_string()
            .try_into()
            .context("Invalid hidden service nickname")?;

        // configure the hidden service
        let hs_config = OnionServiceConfigBuilder::default()
            .nickname(nickname.clone())
            .build()
            .context("Failed to build hidden service config")?;

        // launch the onion service (this is NOT async, returns immediately)
        let (onion_service, rend_requests) = tor_manager
            .client()
            .launch_onion_service(hs_config)
            .context("Failed to launch onion service")?;

        // get the onion address
        let onion_name = onion_service
            .onion_name()
            .context("Failed to get onion name")?;
        let onion_address = format!("{}:{}", onion_name, onion_port);

        info!("✅ Hidden service established at: {}", onion_address);
        self.onion_address = Some(onion_address.clone());

        // set up reverse proxy configuration to forward to the LOCAL proxy
        let local_addr: SocketAddr = format!("127.0.0.1:{}", local_proxy_port)
            .parse()
            .context("Invalid local address")?;

        // create a proxy pattern that matches the onion port
        let pattern =
            ProxyPattern::one_port(onion_port).context("Failed to create proxy pattern")?;

        // create a proxy rule that forwards to the local proxy
        let rule = ProxyRule::new(
            pattern,
            ProxyAction::Forward(Encapsulation::Simple, TargetAddr::Inet(local_addr)),
        );

        // build the proxy configuration
        let mut proxy_config_builder = ProxyConfigBuilder::default();
        proxy_config_builder.proxy_ports().push(rule);
        let proxy_config = proxy_config_builder
            .build()
            .context("Failed to build proxy config")?;

        // create the reverse proxy
        let proxy = OnionServiceReverseProxy::new(proxy_config);

        // run the proxy in the background
        let runtime = tor_rtcompat::tokio::TokioNativeTlsRuntime::current()
            .context("Failed to get Tokio runtime")?;
        let proxy_clone = Arc::clone(&proxy);

        let proxy_handle = tokio::spawn(async move {
            info!("starting reverse proxy for hidden service...");
            if let Err(e) = proxy_clone
                .handle_requests(runtime, nickname, rend_requests)
                .await
            {
                error!("reverse proxy error: {}", e);
            }
        });

        self.onion_service = Some(onion_service);
        self.proxy_handle = Some(proxy_handle);

        info!("✅ Hidden service and proxy started successfully");
        Ok(())
    }

    /// get the .onion address (without http://)
    #[allow(dead_code)]
    pub fn onion_address(&self) -> Option<&str> {
        self.onion_address.as_deref()
    }

    /// get the full .onion URL with http://
    pub fn onion_url(&self) -> Option<String> {
        self.onion_address.as_ref().map(|addr| {
            // Check if it already has a protocol
            if addr.starts_with("http://") || addr.starts_with("https://") {
                addr.clone()
            } else {
                format!("http://{}", addr)
            }
        })
    }

    /// stop the hidden service
    #[allow(dead_code)]
    pub async fn stop(&mut self) -> Result<()> {
        info!("stopping hidden service...");

        // stop the proxy
        if let Some(handle) = self.proxy_handle.take() {
            handle.abort();
            let _ = handle.await;
        }

        // the onion service will be dropped automatically
        self.onion_service = None;
        self.onion_address = None;

        info!("hidden service stopped");
        Ok(())
    }

    /// check if the hidden service is running
    pub fn is_running(&self) -> bool {
        self.onion_service.is_some()
            && self
                .proxy_handle
                .as_ref()
                .map(|h| !h.is_finished())
                .unwrap_or(false)
    }
}

impl Drop for HiddenServiceManager {
    fn drop(&mut self) {
        if let Some(handle) = self.proxy_handle.take() {
            handle.abort();
        }
    }
}
