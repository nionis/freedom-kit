import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import {
  startRailgunEngine,
  stopRailgunEngine,
} from "@railgun-community/wallet";
import { createArtifactStore } from "./artifact-store";
import { createNodeDatabase } from "./db";
import { loadEngineProvider } from "./provider";
import { loadWallet, generateRandomWallet } from "./wallet";

let engineInitialized = false;

export async function start(dataDir: string): Promise<void> {
  console.log("starting railgun engine");

  // create directories
  const walletsDir = join(dataDir, "wallets");
  const artifactsDir = join(dataDir, "artifacts");
  await mkdir(walletsDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });

  const dbPath = join(walletsDir, "engine.db");
  const db = createNodeDatabase(dataDir);
  console.log(`storing data at: ${dbPath}`);

  const artifactStore = createArtifactStore(artifactsDir);

  // check if wallet exists in DB name: "default"
  // create wallet if it doesn't exist and store it in DB encrypted
  // store wallet ID in DB so we can load it later

  await startRailgunEngine(
    "default",
    db,
    true,
    artifactStore,
    false,
    false,
    ["https://ppoi-agg.horsewithsixlegs.xyz"],
    [],
    true
  );

  console.log("railgun engine started");

  const { feesSerialized } = await loadEngineProvider();
  console.log("loaded provider, feesSerialized:", feesSerialized);

  engineInitialized = true;
}

export async function stop(): Promise<void> {
  await stopRailgunEngine();
}

export function isEngineInitialized(): boolean {
  return engineInitialized;
}
