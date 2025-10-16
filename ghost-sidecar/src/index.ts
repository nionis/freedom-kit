import { join } from "node:path";
import fs from "node:fs";
import { homedir } from "node:os";
import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

// Determine if we're running from a pkg bundle
const isPkg = typeof (process as any).pkg !== "undefined";
console.log("Running in pkg mode:", isPkg);

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

// Function to recursively copy directory
function copyDirSync(src: string, dest: string) {
  // Create destination directory if it doesn't exist
  fs.mkdirSync(dest, { recursive: true });

  // Read all files/folders in source
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Get the appropriate Ghost data path
function getGhostPath() {
  if (isPkg) {
    // When packaged, extract to user data directory
    const appDataDir = join(homedir(), ".ghost-freedom-kit");
    const ghostPath = join(appDataDir, "local2");

    // Check if we need to extract the local folder
    if (!fs.existsSync(ghostPath)) {
      console.log("First run detected. Extracting Ghost data...");

      // The bundled assets are in the snapshot filesystem
      const bundledPath = join(__dirname, "..", "local2");

      try {
        console.log(`Copying from ${bundledPath} to ${ghostPath}...`);
        copyDirSync(bundledPath, ghostPath);
        console.log("Ghost data extracted successfully!");

        // Update paths in config.development.json
        const configPath = join(ghostPath, "config.development.json");
        if (fs.existsSync(configPath)) {
          console.log("Updating config paths...");
          const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

          // Update database path
          if (config.database?.connection?.filename) {
            config.database.connection.filename = join(
              ghostPath,
              "content",
              "data",
              "ghost-local.db"
            );
          }

          // Update content path
          if (config.paths?.contentPath) {
            config.paths.contentPath = join(ghostPath, "content");
          }

          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
          console.log("Config paths updated successfully!");
        }
      } catch (error) {
        console.error("Failed to extract Ghost data:", error);
        process.exit(1);
      }
    }

    return ghostPath;
  } else {
    // When running in development, use the local folder directly
    return join(__dirname, "..", "local2");
  }
}

const ghostPath = getGhostPath();

console.log("Starting Ghost from:", ghostPath);
console.log("Ghost will run in the same process (network isolation applied)");
console.log("");

// Set environment variables for Ghost
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// Change to Ghost's directory (Ghost expects to run from its own directory)
const originalCwd = process.cwd();
process.chdir(ghostPath);

// Import and start Ghost directly in this process
// This ensures our http/https patches apply to Ghost's code
try {
  const ghostBoot = require(join(ghostPath, "current", "core", "boot"));
  console.log("🚀 Booting Ghost with network isolation...");
  ghostBoot();
  console.log("✅ Ghost started successfully");
} catch (error) {
  console.error(`Failed to start Ghost: ${(error as Error).message}`);
  console.error((error as Error).stack);
  process.chdir(originalCwd);
  process.exit(1);
}

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down Ghost...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down Ghost...");
  process.exit(0);
});
