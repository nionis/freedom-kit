import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

// ============================================================================
// NETWORK ISOLATION: Block all outgoing clearnet traffic
// ============================================================================
console.log("🔒 Installing network isolation layer...");

// Store original request methods
const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;

// Allowed local addresses
const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isLocalAddress(host: string): boolean {
  // Remove port if present
  const hostname = host.split(":")[0].toLowerCase();

  // Check if it's an allowed host
  if (ALLOWED_HOSTS.has(hostname)) {
    return true;
  }

  // Check if it's a local IP range (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  if (hostname.match(/^10\./)) return true;
  if (hostname.match(/^192\.168\./)) return true;
  if (hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true;

  return false;
}

function blockExternalRequest(options: any, protocol: string): void {
  const host = options.hostname || options.host || "";
  const url = options.href || `${protocol}//${host}${options.path || ""}`;

  if (!isLocalAddress(host)) {
    const error = new Error(
      `🚫 BLOCKED: Outgoing ${protocol.toUpperCase()} request to clearnet blocked for privacy.\n` +
        `   Target: ${url}\n` +
        `   This is intentional - Ghost should not make external requests in privacy mode.`
    );
    (error as any).code = "ENETUNREACH";
    throw error;
  }
}

// Patch http.request
(http as any).request = function (
  url: any,
  options: any,
  callback: any
): http.ClientRequest {
  // Handle different call signatures
  let opts = options;
  let cb = callback;

  if (typeof url === "string" || url instanceof URL) {
    opts = options || {};
    if (typeof url === "string") {
      const parsed = new URL(url);
      opts.hostname = parsed.hostname;
      opts.host = parsed.host;
    } else {
      opts.hostname = url.hostname;
      opts.host = url.host;
    }
  } else {
    opts = url;
    cb = options;
  }

  blockExternalRequest(opts, "http");
  return originalHttpRequest.call(this, url, options, callback);
};

// Patch https.request
(https as any).request = function (
  url: any,
  options: any,
  callback: any
): http.ClientRequest {
  // Handle different call signatures
  let opts = options;
  let cb = callback;

  if (typeof url === "string" || url instanceof URL) {
    opts = options || {};
    if (typeof url === "string") {
      const parsed = new URL(url);
      opts.hostname = parsed.hostname;
      opts.host = parsed.host;
    } else {
      opts.hostname = url.hostname;
      opts.host = url.host;
    }
  } else {
    opts = url;
    cb = options;
  }

  blockExternalRequest(opts, "https");
  return originalHttpsRequest.call(this, url, options, callback);
};

// Patch http.get and https.get (convenience methods)
(http as any).get = function (url: any, options: any, callback: any) {
  const req = (http as any).request(url, options, callback);
  req.end();
  return req;
};

(https as any).get = function (url: any, options: any, callback: any) {
  const req = (https as any).request(url, options, callback);
  req.end();
  return req;
};

console.log("✅ Network isolation layer installed");
console.log(
  "   ✓ All outgoing HTTP/HTTPS requests to clearnet will be blocked"
);
console.log("   ✓ Only localhost/127.0.0.1 traffic is allowed");
console.log("");
