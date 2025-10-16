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
import { setupBalanceCallbacks, runBalancePoller } from "./balances";
import { logger } from "./utils";

let engineInitialized = false;
let walletInitialized = false;

export async function start(dataDir: string): Promise<void> {
  logger.info("Starting Railgun engine");

  // create directories
  const walletsDir = join(dataDir, "wallets");
  const artifactsDir = join(dataDir, "artifacts");
  await mkdir(walletsDir, { recursive: true });
  await mkdir(artifactsDir, { recursive: true });

  const dbPath = join(walletsDir, "engine.db");
  const db = createNodeDatabase(dataDir);
  logger.info(`Storing data at: ${dbPath}`);

  const artifactStore = createArtifactStore(artifactsDir);

  // Initialize Railgun engine (but don't create wallet yet)
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

  logger.info("Railgun engine started");

  const { feesSerialized } = await loadEngineProvider();
  logger.info("Loaded provider, feesSerialized:", feesSerialized);

  // Setup balance callbacks
  setupBalanceCallbacks();

  engineInitialized = true;
}

export async function initializeWallet(railgunId: string): Promise<void> {
  if (!engineInitialized) {
    throw new Error("Engine not initialized");
  }

  if (walletInitialized) {
    logger.warn("Wallet already initialized, skipping");
    return;
  }

  logger.info("Initializing wallet and starting balance polling...");

  // Start balance polling for this wallet
  runBalancePoller([railgunId]);

  walletInitialized = true;
  logger.info("Wallet initialized successfully");
}

export async function stop(): Promise<void> {
  await stopRailgunEngine();
}

export function isEngineInitialized(): boolean {
  return engineInitialized;
}

export function isWalletInitialized(): boolean {
  return walletInitialized;
}
