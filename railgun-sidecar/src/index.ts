import { join } from "node:path";
import { homedir } from "node:os";
import fs from "node:fs";

const appDataDir = join(homedir(), ".railgun-freedom-kit");

// mkdir if it does not exist
if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}

console.log("starting Railgun from:", appDataDir);

// Instead of spawning, just import and run hey.js
import { start, stop } from "./engine";
start(appDataDir);

// listen for SIGINT and SIGTERM
process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down Railgun...");
  stop();
});
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down Railgun...");
  stop();
});
