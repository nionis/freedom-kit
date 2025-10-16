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

/// Inject the combined TOR + Railgun banner into the current page
async fn inject_onion_banner(app_handle: &tauri::AppHandle) {
    println!("🔄 Injecting combined banner into Ghost page...");

    // Get the onion address
    let state = app_handle.state::<AppState>();
    let onion_address = {
        let hs = state.hidden_service.lock().await;
        hs.as_ref().and_then(|s| s.onion_url())
    };

    // Mock Railgun data - pretending the user already has a loaded wallet
    let railgun_address =
        Some("0zk1qyk9nn5zvjwprfv2qe6cdmzk4wwvvz7w3qjk8xrandom3example8address4mock".to_string());
    let railgun_balance = "0".to_string();

    // NOTE: Railgun sidecar is disabled - using mock data above
    // let client = reqwest::Client::new();
    // let railgun_address = match client.get("http://localhost:8080/wallet/address").send().await { ... };
    // let railgun_balance = match client.get("http://localhost:8080/wallet/balance").send().await { ... };

    let banner_js = if onion_address.is_some() || railgun_address.is_some() {
        let tor_section = if let Some(addr) = &onion_address {
            format!(
                r#"
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                <div style="font-size: 20px;">🧅</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">
                        TOR Hidden Service
                    </div>
                    <div style="font-family: monospace; font-size: 11px; opacity: 0.95; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        {}
                    </div>
                </div>
                <button id='copy-onion-btn' style="
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 6px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.2s;
                    white-space: nowrap;
                ">📋 Copy</button>
            </div>
            "#,
                addr
            )
        } else {
            String::new()
        };

        let railgun_section = if let Some(addr) = &railgun_address {
            format!(
                r#"
            <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                <div style="font-size: 20px;">🔒</div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">
                        Railgun Wallet
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <div style="font-family: monospace; font-size: 11px; opacity: 0.95; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0;">
                            {}
                        </div>
                        <div class="railgun-balance" style="font-weight: 600; font-size: 12px; white-space: nowrap;">
                            {} WETH
                        </div>
                    </div>
                </div>
                <button id='copy-railgun-btn' style="
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 6px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.2s;
                    white-space: nowrap;
                ">📋 Copy</button>
            </div>
            "#,
                addr, railgun_balance
            )
        } else {
            String::new()
        };

        let divider = if !tor_section.is_empty() && !railgun_section.is_empty() {
            r#"<div style="width: 1px; height: 40px; background: rgba(255, 255, 255, 0.3); margin: 0 8px;"></div>"#
        } else {
            ""
        };

        format!(
            r#"
(function() {{
    // Remove any existing banner first
    const existing = document.getElementById('freedom-kit-onion-banner');
    if (existing) existing.remove();
    
    // Create the banner
    const banner = document.createElement('div');
    banner.id = 'freedom-kit-onion-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    `;
    
    banner.innerHTML = `
        {}
        {}
        {}
        <button id='close-onion-banner' style="
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        ">×</button>
    `;
    
    document.body.appendChild(banner);
    
    // Adjust body padding to account for banner
    const adjustBodyPadding = () => {{
        document.body.style.paddingTop = banner.offsetHeight + 'px';
    }};
    adjustBodyPadding();
    window.addEventListener('resize', adjustBodyPadding);
    
    // Copy button handlers
    const onionBtn = document.getElementById('copy-onion-btn');
    if (onionBtn) {{
        onionBtn.addEventListener('click', async () => {{
            try {{
                await navigator.clipboard.writeText('{}');
                onionBtn.textContent = '✅ Copied!';
                onionBtn.style.background = 'rgba(76, 175, 80, 0.5)';
                setTimeout(() => {{
                    onionBtn.textContent = '📋 Copy';
                    onionBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                }}, 2000);
            }} catch (error) {{
                console.error('Failed to copy:', error);
                onionBtn.textContent = '❌ Failed';
                setTimeout(() => {{
                    onionBtn.textContent = '📋 Copy';
                }}, 2000);
            }}
        }});
        onionBtn.addEventListener('mouseenter', () => {{
            if (!onionBtn.textContent.includes('Copied')) {{
                onionBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
        }});
        onionBtn.addEventListener('mouseleave', () => {{
            if (!onionBtn.textContent.includes('Copied')) {{
                onionBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
        }});
    }}
    
    const railgunBtn = document.getElementById('copy-railgun-btn');
    if (railgunBtn) {{
        railgunBtn.addEventListener('click', async () => {{
            try {{
                await navigator.clipboard.writeText('{}');
                railgunBtn.textContent = '✅ Copied!';
                railgunBtn.style.background = 'rgba(76, 175, 80, 0.5)';
                setTimeout(() => {{
                    railgunBtn.textContent = '📋 Copy';
                    railgunBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                }}, 2000);
            }} catch (error) {{
                console.error('Failed to copy:', error);
                railgunBtn.textContent = '❌ Failed';
                setTimeout(() => {{
                    railgunBtn.textContent = '📋 Copy';
                }}, 2000);
            }}
        }});
        railgunBtn.addEventListener('mouseenter', () => {{
            if (!railgunBtn.textContent.includes('Copied')) {{
                railgunBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
        }});
        railgunBtn.addEventListener('mouseleave', () => {{
            if (!railgunBtn.textContent.includes('Copied')) {{
                railgunBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
        }});
    }}
    
    // Close button handler
    document.getElementById('close-onion-banner').addEventListener('click', () => {{
        banner.style.transform = 'translateY(-100%)';
        banner.style.opacity = '0';
        document.body.style.paddingTop = '0';
        setTimeout(() => banner.remove(), 300);
    }});
    
    // Hover effects
    const closeBtn = document.getElementById('close-onion-banner');
    closeBtn.addEventListener('mouseenter', () => {{
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    }});
    closeBtn.addEventListener('mouseleave', () => {{
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    }});
    
    // Animate in
    banner.style.transition = 'all 0.3s ease';
    setTimeout(() => {{
        banner.style.transform = 'translateY(0)';
    }}, 10);
    
    // NOTE: Balance refresh disabled since we're using mock Railgun data
    // const hasRailgun = banner.querySelector('.railgun-balance');
    // if (hasRailgun) {{
    //     setInterval(async () => {{
    //         try {{
    //             const response = await fetch('http://localhost:8080/wallet/balance');
    //             if (response.ok) {{
    //                 const data = await response.json();
    //                 const balanceEl = banner.querySelector('.railgun-balance');
    //                 if (balanceEl) {{
    //                     balanceEl.textContent = data.balance + ' WETH';
    //                 }}
    //             }}
    //         }} catch (error) {{
    //             console.error('Failed to refresh balance:', error);
    //         }}
    //     }}, 30000);
    // }}
}})();
"#,
            tor_section,
            divider,
            railgun_section,
            onion_address.as_ref().unwrap_or(&"".to_string()),
            railgun_address.as_ref().unwrap_or(&"".to_string())
        )
    } else {
        // If onion address is not ready yet, show a loading banner
        r#"
(function() {
    const banner = document.createElement('div');
    banner.id = 'freedom-kit-onion-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    banner.innerHTML = `
        <div style="font-size: 20px;">🧅</div>
        <div>
            <div style="font-weight: 600; font-size: 13px;">
                TOR Hidden Service
            </div>
            <div style="font-size: 11px; opacity: 0.9;">
                ⏳ Bootstrapping...
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    document.body.style.paddingTop = banner.offsetHeight + 'px';
})();
"#
        .to_string()
    };

    // Inject the JavaScript
    if let Some(window) = app_handle.get_webview_window("main") {
        match window.eval(&banner_js) {
            Ok(_) => println!("✅ Onion banner injected successfully"),
            Err(e) => eprintln!("❌ Failed to inject banner: {}", e),
        }
    }
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
        .invoke_handler(tauri::generate_handler![
            get_onion_address,
            is_tor_running,
            // NOTE: Railgun commands disabled - using mock data instead
            // check_railgun_wallet_exists,
            // create_railgun_wallet,
            // unlock_railgun_wallet,
            // get_railgun_address,
            // get_railgun_balance
        ])
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

            // NOTE: Railgun sidecar disabled - using mock data in banner
            // Spawn the railgun-sidecar binary
            // let railgun_sidecar_command = app.shell().sidecar("railgun-sidecar").unwrap();
            // let (mut railgun_rx, railgun_child) = railgun_sidecar_command
            //     .spawn()
            //     .expect("Failed to spawn Railgun sidecar");

            // Store the Railgun child process in app state
            // let state = app.state::<AppState>();
            // tauri::async_runtime::block_on(async {
            //     *state.railgun_child.lock().await = Some(railgun_child);
            // });

            // Create a thread to handle output from the railgun sidecar
            // tauri::async_runtime::spawn(async move {
            //     while let Some(event) = railgun_rx.recv().await {
            //         match event {
            //             tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
            //                 println!("[Railgun stdout]: {}", String::from_utf8_lossy(&line));
            //             }
            //             tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
            //                 eprintln!("[Railgun stderr]: {}", String::from_utf8_lossy(&line));
            //             }
            //             tauri_plugin_shell::process::CommandEvent::Error(err) => {
            //                 eprintln!("[Railgun error]: {}", err);
            //             }
            //             tauri_plugin_shell::process::CommandEvent::Terminated(status) => {
            //                 println!("[Railgun terminated]: {:?}", status);
            //             }
            //             _ => {}
            //         }
            //     }
            // });

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

                                    // Clone app_handle for the async tasks
                                    let app_for_banner = app_handle.clone();
                                    // let app_for_wallet = app_handle.clone(); // Not needed - wallet popup disabled

                                    // Wait a moment for the page to load, then inject the banner
                                    tauri::async_runtime::spawn(async move {
                                        tokio::time::sleep(Duration::from_secs(2)).await;
                                        inject_onion_banner(&app_for_banner).await;
                                    });

                                    // NOTE: Skipping Railgun wallet setup popup - pretending user already has loaded wallet
                                    // Show Railgun wallet setup popup after a brief delay
                                    // tauri::async_runtime::spawn(async move {
                                    //     tokio::time::sleep(Duration::from_secs(3)).await;
                                    //     inject_railgun_wallet_popup(&app_for_wallet).await;
                                    // });
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

                        // If we're already on the Ghost page, inject/update the banner
                        if let Some(window) = app_handle.get_webview_window("main") {
                            if let Ok(url) = window.url() {
                                let url_str = url.to_string();
                                if url_str.contains("localhost:2368")
                                    || url_str.contains("127.0.0.1:2368")
                                {
                                    println!("🔄 Updating banner with TOR address...");
                                    inject_onion_banner(&app_handle).await;
                                }
                            }
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
                println!("🛑 Window destroyed, cleaning up processes...");
                let state = window.state::<AppState>();
                tauri::async_runtime::block_on(async {
                    if let Some(child) = state.ghost_child.lock().await.take() {
                        println!("🔴 Killing Ghost sidecar process...");
                        match child.kill() {
                            Ok(_) => println!("✅ Ghost process killed successfully"),
                            Err(e) => eprintln!("❌ Failed to kill Ghost process: {}", e),
                        }
                    }
                    // NOTE: Railgun cleanup disabled - sidecar not spawned
                    // if let Some(child) = state.railgun_child.lock().await.take() {
                    //     println!("🔴 Killing Railgun sidecar process...");
                    //     match child.kill() {
                    //         Ok(_) => println!("✅ Railgun process killed successfully"),
                    //         Err(e) => eprintln!("❌ Failed to kill Railgun process: {}", e),
                    //     }
                    // }
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
