import { spawn } from "node:child_process";
import { join } from "node:path";
import fs from "node:fs";
import { homedir } from "node:os";

// Determine if we're running from a pkg bundle
const isPkg = typeof process["pkg"] !== "undefined";
console.log("Running in pkg mode:", isPkg);

// Function to recursively copy directory
function copyDirSync(src, dest) {
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
    const ghostPath = join(appDataDir, "local");

    // Check if we need to extract the local folder
    if (!fs.existsSync(ghostPath)) {
      console.log("First run detected. Extracting Ghost data...");

      // The bundled assets are in the snapshot filesystem
      const bundledPath = join(__dirname, "local");

      try {
        console.log(`Copying from ${bundledPath} to ${ghostPath}...`);
        copyDirSync(bundledPath, ghostPath);
        console.log("Ghost data extracted successfully!");
      } catch (error) {
        console.error("Failed to extract Ghost data:", error);
        process.exit(1);
      }
    }

    return ghostPath;
  } else {
    // When running in development, use the local folder directly
    return join(__dirname, "local");
  }
}

const ghostPath = getGhostPath();

console.log("Starting Ghost from:", ghostPath);
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
