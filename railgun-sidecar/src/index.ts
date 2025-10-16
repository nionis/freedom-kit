import { join } from "node:path";
import { homedir } from "node:os";
import fs from "node:fs";
import { start, stop } from "./engine";
import { startApiServer } from "./api";
import { logger } from "./utils";

const appDataDir = join(homedir(), ".railgun-freedom-kit");

// mkdir if it does not exist
if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}

logger.info("Starting Railgun from:", appDataDir);

// Start the engine and API server
async function main() {
  try {
    // Start Railgun engine
    await start(appDataDir);

    // Start HTTP API server
    await startApiServer();

    logger.info("Railgun sidecar is ready");
  } catch (error) {
    logger.error("Failed to start Railgun sidecar:", error);
    process.exit(1);
  }
}

main();

// listen for SIGINT and SIGTERM
process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down Railgun...");
  stop();
  setTimeout(() => process.exit(0), 1e3);
});
process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down Railgun...");
  stop();
  setTimeout(() => process.exit(0), 1e3);
});
