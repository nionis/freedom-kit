mod tor;

use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tauri::{Emitter, Manager};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;
use tokio::sync::Mutex;
use tor::{HiddenServiceConfig, HiddenServiceManager};

// Tauri state to hold the hidden service manager and Ghost process
pub struct AppState {
    hidden_service: Arc<Mutex<Option<HiddenServiceManager>>>,
    ghost_child: Arc<Mutex<Option<CommandChild>>>,
}

// Tauri command to get the onion address
#[tauri::command]
async fn get_onion_address(state: tauri::State<'_, AppState>) -> Result<Option<String>, String> {
    let hs = state.hidden_service.lock().await;
    let address = hs.as_ref().and_then(|s| s.onion_url());
    println!("📞 get_onion_address called, returning: {:?}", address);
    Ok(address)
}

// Tauri command to check if the hidden service is running
#[tauri::command]
async fn is_tor_running(state: tauri::State<'_, AppState>) -> Result<bool, String> {
    let hs = state.hidden_service.lock().await;
    Ok(hs.as_ref().map(|s| s.is_running()).unwrap_or(false))
}

/// Check if Ghost is ready by polling the endpoint
async fn wait_for_ghost_ready(url: &str, max_attempts: u32) -> anyhow::Result<()> {
    println!("⏳ Waiting for Ghost to be ready at {}...", url);

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()?;

    let mut successful_checks = 0;
    const REQUIRED_SUCCESSFUL_CHECKS: u32 = 3;

    for attempt in 1..=max_attempts {
        match client.get(url).send().await {
            Ok(response)
                if response.status().is_success() || response.status().is_redirection() =>
            {
                // Check if we got actual HTML content
                match response.text().await {
                    Ok(body) if !body.is_empty() && body.len() > 100 => {
                        successful_checks += 1;
                        println!(
                            "✅ Ghost responded with content (check {}/{}, attempt {}/{})",
                            successful_checks, REQUIRED_SUCCESSFUL_CHECKS, attempt, max_attempts
                        );

                        // Require multiple successful checks to ensure Ghost is truly ready
                        if successful_checks >= REQUIRED_SUCCESSFUL_CHECKS {
                            println!("🎉 Ghost is fully ready!");
                            // Add a final delay to ensure Ghost has finished initializing
                            tokio::time::sleep(Duration::from_secs(2)).await;
                            return Ok(());
                        }
                    }
                    Ok(body) => {
                        println!(
                            "⏳ Ghost responded but content looks incomplete (size: {} bytes, attempt {}/{})",
                            body.len(),
                            attempt,
                            max_attempts
                        );
                        successful_checks = 0; // Reset counter if content looks incomplete
                    }
                    Err(e) => {
                        println!(
                            "⏳ Ghost responded but failed to read body: {} (attempt {}/{})",
                            e, attempt, max_attempts
                        );
                        successful_checks = 0;
                    }
                }
            }
            Ok(response) => {
                println!(
                    "⏳ Ghost returned status {} (attempt {}/{})",
                    response.status(),
                    attempt,
                    max_attempts
                );
                successful_checks = 0;
            }
            Err(e) => {
                println!(
                    "⏳ Ghost not ready yet: {} (attempt {}/{})",
                    e, attempt, max_attempts
                );
                successful_checks = 0;
            }
        }

        if attempt < max_attempts {
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    }

    Err(anyhow::anyhow!(
        "Ghost failed to start after {} attempts",
        max_attempts
    ))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            hidden_service: Arc::new(Mutex::new(None)),
            ghost_child: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![get_onion_address, is_tor_running])
        .setup(|app| {
            // Get the path to the ghost-sidecar binary
            let sidecar_command = app.shell().sidecar("ghost-sidecar").unwrap();

            // Spawn the sidecar process
            let (mut rx, child) = sidecar_command
                .spawn()
                .expect("Failed to spawn Ghost sidecar");

            // Store the child process in app state for cleanup on exit
            let state = app.state::<AppState>();
            tauri::async_runtime::block_on(async {
                *state.ghost_child.lock().await = Some(child);
            });

            // Create a thread to handle output from the sidecar
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                            println!("[Ghost stdout]: {}", String::from_utf8_lossy(&line));
                        }
                        tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                            eprintln!("[Ghost stderr]: {}", String::from_utf8_lossy(&line));
                        }
                        tauri_plugin_shell::process::CommandEvent::Error(err) => {
                            eprintln!("[Ghost error]: {}", err);
                        }
                        tauri_plugin_shell::process::CommandEvent::Terminated(status) => {
                            println!("[Ghost terminated]: {:?}", status);
                        }
                        _ => {}
                    }
                }
            });

            // Wait for Ghost to be ready and then navigate
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match wait_for_ghost_ready("http://localhost:2368", 40).await {
                    Ok(_) => {
                        println!("🎉 Ghost is ready!");

                        // Emit ghost-ready event to the frontend
                        let _ = app_handle.emit("ghost-ready", ());

                        // Wait a moment to let the loading screen show the onion address if available
                        tokio::time::sleep(Duration::from_secs(2)).await;

                        // Now navigate to Ghost
                        if let Some(window) = app_handle.get_webview_window("main") {
                            match window
                                .navigate(tauri::Url::parse("http://localhost:2368/ghost").unwrap())
                            {
                                Ok(_) => {
                                    println!("✅ Window navigated to Ghost");
                                }
                                Err(e) => eprintln!("❌ Failed to navigate window: {}", e),
                            }
                        }
                    }
                    Err(e) => {
                        eprintln!("❌ Ghost failed to start: {}", e);

                        // Show error page in the window
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let error_html = format!(
                                r#"<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }}
        .error-container {{
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            max-width: 500px;
        }}
        h1 {{ color: #d32f2f; margin-top: 0; }}
        .error-icon {{ font-size: 48px; margin-bottom: 20px; }}
        p {{ color: #666; line-height: 1.6; margin: 15px 0; }}
        .error-details {{ 
            background: #f5f5f5; 
            padding: 15px; 
            border-radius: 6px; 
            font-size: 13px;
            color: #333;
            margin: 20px 0;
            word-wrap: break-word;
        }}
        button {{
            margin-top: 20px;
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
        }}
        button:hover {{ background: #1976D2; }}
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>Ghost Failed to Start</h1>
        <p>The Ghost CMS server could not be started.</p>
        <div class="error-details">{}</div>
        <p><strong>Common causes:</strong></p>
        <p>• Port 2368 is already in use<br>
           • Another Ghost instance is running<br>
           • Database locked by another process</p>
        <button onclick="window.location.reload()">Retry</button>
    </div>
</body>
</html>"#,
                                e.to_string().replace("<", "&lt;").replace(">", "&gt;")
                            );

                            if let Ok(url) = tauri::Url::parse(&format!(
                                "data:text/html;charset=utf-8,{}",
                                urlencoding::encode(&error_html)
                            )) {
                                let _ = window.navigate(url);
                            }
                        }

                        let _ = app_handle.emit("ghost-error", format!("{}", e));
                    }
                }
            });

            // Initialize TOR hidden service in the background
            let state = app.state::<AppState>();
            let hs_manager = state.hidden_service.clone();
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                println!("🔄 Starting TOR hidden service setup...");
                match setup_tor_hidden_service(hs_manager.clone()).await {
                    Ok(onion_address) => {
                        println!("🎉 Ghost is now available on TOR!");
                        println!("🧅 Onion address: {}", onion_address);

                        // Emit event to frontend
                        println!(
                            "📡 Emitting tor-ready event to frontend with address: {}",
                            onion_address
                        );
                        match app_handle.emit("tor-ready", onion_address.clone()) {
                            Ok(_) => println!("✅ tor-ready event emitted successfully"),
                            Err(e) => eprintln!("❌ Failed to emit tor-ready event: {}", e),
                        }
                    }
                    Err(e) => {
                        eprintln!("❌ Failed to setup TOR hidden service: {}", e);
                        eprintln!("Error details: {:?}", e);
                        let _ = app_handle.emit("tor-error", format!("{}", e));
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                println!("🛑 Window destroyed, cleaning up Ghost process...");
                let state = window.state::<AppState>();
                tauri::async_runtime::block_on(async {
                    if let Some(child) = state.ghost_child.lock().await.take() {
                        println!("🔴 Killing Ghost sidecar process...");
                        match child.kill() {
                            Ok(_) => println!("✅ Ghost process killed successfully"),
                            Err(e) => eprintln!("❌ Failed to kill Ghost process: {}", e),
                        }
                    }
                });
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Setup the TOR hidden service for Ghost
async fn setup_tor_hidden_service(
    hs_manager: Arc<Mutex<Option<HiddenServiceManager>>>,
) -> anyhow::Result<String> {
    // Get the app data directory for TOR storage
    let app_data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("ghost-freedom-kit");

    let tor_data_dir = app_data_dir.join("tor");

    // TODO: fix
    // Create directories with proper permissions (0700 - owner only)
    // TOR requires strict permissions for security
    std::fs::create_dir_all(&tor_data_dir)?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let permissions = std::fs::Permissions::from_mode(0o700);

        // Set permissions on both parent and tor directory
        std::fs::set_permissions(&app_data_dir, permissions.clone())?;
        std::fs::set_permissions(&tor_data_dir, permissions)?;

        println!(
            "📁 TOR data directory: {:?} (permissions: 0700)",
            tor_data_dir
        );
    }

    #[cfg(not(unix))]
    {
        println!("📁 TOR data directory: {:?}", tor_data_dir);
    }

    // Start the local HTTP proxy that forwards to Ghost
    println!("🔄 Starting local reverse proxy...");
    let (local_proxy_port, _proxy_handle) = tor::proxy::start_local_proxy(2368).await?;
    println!(
        "✅ Local proxy running on port {} (forwarding to Ghost on 2368)",
        local_proxy_port
    );

    // Bootstrap the TOR client
    println!("🔄 Bootstrapping TOR client...");
    let tor_manager = tor::tor_client::bootstrap_tor_client(Some(tor_data_dir.clone())).await?;
    println!("✅ TOR client ready!");

    // Create and start the hidden service
    let config = HiddenServiceConfig {
        tor_data_dir: tor_data_dir.clone(),
        local_port: local_proxy_port, // Use the local proxy port
        onion_port: 80,               // Standard HTTP port on the .onion address
    };

    println!("🔄 Creating hidden service...");
    let mut hidden_service = HiddenServiceManager::new(config)?;

    // Start the hidden service (forwards port 80 on .onion to local proxy)
    hidden_service
        .start(tor_manager, local_proxy_port, 80)
        .await?;

    let onion_address = hidden_service
        .onion_url()
        .ok_or_else(|| anyhow::anyhow!("Failed to get onion address"))?;

    // Store the hidden service manager in app state
    *hs_manager.lock().await = Some(hidden_service);

    Ok(onion_address)
}
