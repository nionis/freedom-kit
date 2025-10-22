import { join } from "node:path";
import fs from "node:fs";
import {
  HOM_ROOT,
  LOC_GHOST_FOLDER,
  BIN_GHOST_FOLDER,
  BIN_GHOST_CONFIG,
  BIN_GHOST_ZIP,
} from "./utils";
import { decompressFolder } from "./decompress";
import "./firewall";

// Determine if we're running from a pkg bundle
const isPkg = typeof (process as any).pkg !== "undefined";
console.log("Running in pkg mode:", isPkg);

// Get the appropriate Ghost data path
async function getGhostPath() {
  // running in development, using the folder in this dir
  if (!isPkg) {
    return LOC_GHOST_FOLDER;
  }

  // if the folder already exists, return it
  if (fs.existsSync(BIN_GHOST_FOLDER)) {
    return BIN_GHOST_FOLDER;
  }

  console.log("First run detected, extracting Ghost data...");

  try {
    // make app folder
    fs.mkdirSync(HOM_ROOT, { recursive: true });
    // copy the zip file to the bin root
    console.log("Decompressing Ghost data...");
    await decompressFolder(BIN_GHOST_ZIP, BIN_GHOST_FOLDER);
    console.log("Ghost data extracted successfully!");

    console.log("Updating config paths...");
    const config = JSON.parse(fs.readFileSync(BIN_GHOST_CONFIG, "utf-8"));

    // Update database path
    if (config.database?.connection?.filename) {
      config.database.connection.filename = join(
        BIN_GHOST_FOLDER,
        "content",
        "data",
        "ghost-local.db"
      );
    }

    // Update content path
    if (config.paths?.contentPath) {
      config.paths.contentPath = join(BIN_GHOST_FOLDER, "content");
    }

    fs.writeFileSync(BIN_GHOST_CONFIG, JSON.stringify(config, null, 2));
    console.log("Config paths updated successfully!");

    return BIN_GHOST_FOLDER;
  } catch (error) {
    console.error("Failed to extract Ghost data:", error);
    process.exit(1);
  }
}

async function start() {
  const ghostPath = await getGhostPath();

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
}

start().catch(console.error);
