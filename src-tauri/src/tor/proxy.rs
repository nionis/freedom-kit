use anyhow::{Context, Result};
use hyper::body::Incoming;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response};
use hyper_util::rt::TokioIo;
use std::convert::Infallible;
use tokio::net::TcpListener;
use tracing::{error, info};

/// Start a local HTTP reverse proxy that forwards to Ghost
/// Returns the local port it's listening on and a handle to the background task
pub async fn start_local_proxy(ghost_port: u16) -> Result<(u16, tokio::task::JoinHandle<()>)> {
    // Bind to a random available port
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .context("Failed to bind proxy listener")?;

    let local_addr = listener.local_addr()?;
    info!("Local proxy listening on {}", local_addr);

    let handle = tokio::spawn(async move {
        loop {
            match listener.accept().await {
                Ok((stream, _)) => {
                    let io = TokioIo::new(stream);

                    tokio::spawn(async move {
                        let service = service_fn(move |req| proxy_request(req, ghost_port));

                        if let Err(e) = http1::Builder::new().serve_connection(io, service).await {
                            error!("Error serving connection: {}", e);
                        }
                    });
                }
                Err(e) => {
                    error!("Failed to accept connection: {}", e);
                }
            }
        }
    });

    Ok((local_addr.port(), handle))
}

async fn proxy_request(
    req: Request<Incoming>,
    ghost_port: u16,
) -> Result<Response<String>, Infallible> {
    // Build the Ghost URL
    let ghost_url = format!(
        "http://127.0.0.1:{}{}",
        ghost_port,
        req.uri()
            .path_and_query()
            .map(|x| x.as_str())
            .unwrap_or("/")
    );

    info!("Proxying {} to {}", req.uri(), ghost_url);

    // Forward the request to Ghost with automatic decompression support
    let client = reqwest::Client::builder()
        .gzip(true) // Enable automatic gzip decompression
        .brotli(true) // Enable automatic brotli decompression
        .deflate(true) // Enable automatic deflate decompression
        .build()
        .unwrap_or_else(|_| reqwest::Client::new());

    let mut ghost_req = client.request(req.method().clone(), &ghost_url);

    // Copy headers (but not Content-Encoding related ones)
    for (name, value) in req.headers() {
        let name_lower = name.as_str().to_lowercase();
        // Skip headers that will be recalculated or handled by reqwest
        if name_lower != "content-encoding" && name_lower != "content-length" {
            if let Ok(value_str) = value.to_str() {
                ghost_req = ghost_req.header(name.as_str(), value_str);
            }
        }
    }

    // Send request and get response
    match ghost_req.send().await {
        Ok(resp) => {
            let status = resp.status();
            let headers: reqwest::header::HeaderMap = resp.headers().clone();

            // Get the body (already decompressed by reqwest)
            let body = resp.text().await.unwrap_or_default();

            let mut response_builder: hyper::http::response::Builder =
                Response::builder().status(status);

            // Forward response headers (excluding compression-related headers)
            for (name, value) in headers.iter() {
                let name_lower: String = name.as_str().to_lowercase();
                // Skip Content-Encoding and Content-Length since body is already decompressed
                if name_lower != "content-encoding" && name_lower != "content-length" {
                    if let Ok(value_str) = value.to_str() {
                        response_builder = response_builder.header(name.as_str(), value_str);
                    }
                }
            }

            let response = response_builder.body(body).unwrap();

            Ok(response)
        }
        Err(e) => {
            error!("Failed to proxy request: {}", e);
            let response = Response::builder()
                .status(502)
                .body(format!("Proxy error: {}", e))
                .unwrap();
            Ok(response)
        }
    }
}
