import express from "express";
import cors from "cors";
import { PORT } from "./env";
import { logger } from "./utils";
import {
  walletExists,
  createWalletWithPassword,
  unlockWalletWithPassword,
  getWalletAddress,
  getWalletId,
  isWalletUnlocked,
} from "./wallet";
import { initializeWallet } from "./engine";
import { getSpendableWethBalance } from "./balances";
import { formatUnits } from "ethers";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Check if wallet exists
app.get("/wallet/exists", async (req, res) => {
  try {
    const exists = await walletExists();
    res.json({ exists });
  } catch (error: any) {
    logger.error("Error checking wallet existence:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create new wallet with password
app.post("/wallet/create", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Check if wallet already exists
    if (walletExists()) {
      return res.status(400).json({ error: "Wallet already exists" });
    }

    logger.info("Creating new Railgun wallet...");
    const { railgunAddress, railgunId } = await createWalletWithPassword(
      password
    );

    logger.info("Wallet created successfully:", railgunAddress);

    // Initialize wallet in the engine and start balance polling
    await initializeWallet(railgunId);

    logger.info("Wallet created successfully:", railgunAddress);
    res.json({ address: railgunAddress });
  } catch (error: any) {
    logger.error("Error creating wallet:", error);
    res.status(500).json({ error: error.message });
  }
});

// Unlock existing wallet with password
app.post("/wallet/unlock", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }

    // Check if wallet exists
    if (!(await walletExists())) {
      return res.status(404).json({ error: "No wallet found" });
    }

    logger.info("Unlocking Railgun wallet...");
    const { railgunAddress, railgunId } = await unlockWalletWithPassword(
      password
    );

    // Initialize wallet in the engine and start balance polling
    await initializeWallet(railgunId);

    logger.info("Wallet unlocked successfully:", railgunAddress);
    res.json({ address: railgunAddress });
  } catch (error: any) {
    logger.error("Error unlocking wallet:", error);
    res
      .status(error.message.includes("Invalid password") ? 401 : 500)
      .json({ error: error.message });
  }
});

// Get wallet address (requires unlocked wallet)
app.get("/wallet/address", (req, res) => {
  try {
    if (!isWalletUnlocked()) {
      return res.status(401).json({ error: "Wallet is locked" });
    }

    const address = getWalletAddress();
    res.json({ address });
  } catch (error: any) {
    logger.error("Error getting wallet address:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get WETH balance (requires unlocked wallet)
app.get("/wallet/balance", (req, res) => {
  try {
    if (!isWalletUnlocked()) {
      return res.status(401).json({ error: "Wallet is locked" });
    }

    const walletId = getWalletId(); // Get the wallet ID for balance lookup
    const balanceWei = getSpendableWethBalance(walletId);
    const balanceEth = formatUnits(balanceWei, 18); // WETH has 18 decimals

    res.json({ balance: balanceEth, balanceWei: balanceWei.toString() });
  } catch (error: any) {
    logger.error("Error getting wallet balance:", error);
    res.status(500).json({ error: error.message });
  }
});

export function startApiServer(): Promise<void> {
  return new Promise((resolve) => {
    app.listen(PORT, () => {
      logger.info(`Railgun API server listening on port ${PORT}`);
      resolve();
    });
  });
}
