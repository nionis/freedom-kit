const { spawn } = require("node:child_process");
const { join } = require("node:path");
const fs = require("node:fs");
const { homedir } = require("node:os");

const dataDir = join(homedir(), ".hpc-freedom-kit");

console.log("Starting HPC from:", dataDir);
console.log("Running in pkg mode:", isPkg);

// Start Ghost using ghost-cli
const ghostProcess = spawn("node", [join(ghostPath, "current", "index.js")], {
  cwd: ghostPath,
  env: {
    ...process.env,
    NODE_ENV: "development",
  },
});

ghostProcess.stdout.on("data", (data) => {
  console.log(`[Ghost]: ${data.toString().trim()}`);
});

ghostProcess.stderr.on("data", (data) => {
  console.error(`[Ghost Error]: ${data.toString().trim()}`);
});

ghostProcess.on("error", (error) => {
  console.error(`Failed to start Ghost: ${error.message}`);
  process.exit(1);
});

ghostProcess.on("exit", (code, signal) => {
  if (code !== null) {
    console.log(`Ghost exited with code ${code}`);
  } else if (signal !== null) {
    console.log(`Ghost killed with signal ${signal}`);
  }
  process.exit(code || 0);
});

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down Ghost...");
  ghostProcess.kill("SIGTERM");
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down Ghost...");
  ghostProcess.kill("SIGINT");
});
