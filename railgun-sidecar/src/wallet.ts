import {
  randomBytes,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import { join } from "node:path";
import { homedir } from "node:os";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { Wallet } from "ethers";
import {
  createRailgunWallet as createRailgunWalletBase,
  loadWalletByID,
  getWalletShareableViewingKey,
} from "@railgun-community/wallet";

// Wallet state
let currentWallet: {
  railgunId: string;
  railgunAddress: string;
  publicViewingKey: string;
} | null = null;

const WALLET_FILE_PATH = join(homedir(), ".railgun-freedom-kit", "wallet.enc");

/** Derive encryption key from password using PBKDF2 */
function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

/** Encrypt data with AES-256-GCM */
function encryptData(data: string, password: string): string {
  const salt = randomBytes(32);
  const key = deriveKeyFromPassword(password, salt);
  const iv = randomBytes(16);

  const cipher = createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine salt + iv + authTag + encrypted data
  return Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, "hex"),
  ]).toString("base64");
}

/** Decrypt data with AES-256-GCM */
function decryptData(encryptedData: string, password: string): string {
  const buffer = Buffer.from(encryptedData, "base64");

  const salt = buffer.subarray(0, 32);
  const iv = buffer.subarray(32, 48);
  const authTag = buffer.subarray(48, 64);
  const encrypted = buffer.subarray(64);

  const key = deriveKeyFromPassword(password, salt);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/** Check if wallet file exists */
export function walletExists(): boolean {
  return existsSync(WALLET_FILE_PATH);
}

/** Save encrypted wallet to file */
function saveEncryptedWallet(
  mnemonic: string,
  railgunId: string,
  railgunEncryptionSalt: string,
  password: string
): void {
  const walletData = JSON.stringify({
    mnemonic,
    railgunId,
    railgunEncryptionSalt,
  });
  const encrypted = encryptData(walletData, password);
  writeFileSync(WALLET_FILE_PATH, encrypted, "utf8");
}

/** Load encrypted wallet from file */
function loadEncryptedWallet(password: string): {
  mnemonic: string;
  railgunId: string;
  railgunEncryptionSalt: string;
} {
  if (!walletExists()) {
    throw new Error("No wallet file found");
  }

  const encrypted = readFileSync(WALLET_FILE_PATH, "utf8");

  try {
    const decrypted = decryptData(encrypted, password);
    const walletData = JSON.parse(decrypted);
    return walletData;
  } catch (error) {
    throw new Error("Invalid password or corrupted wallet file");
  }
}

/** Create a wallet with password-based encryption */
export async function createWalletWithPassword(password: string) {
  if (walletExists()) {
    throw new Error("Wallet already exists");
  }

  // Generate random mnemonic
  const mnemonic = Wallet.createRandom().mnemonic!.phrase;

  // Use password-derived key for Railgun wallet encryption
  const railgunEncryptionSalt = randomBytes(32);
  const encryptionKey = deriveKeyFromPassword(
    password,
    railgunEncryptionSalt
  ).toString("hex");

  const railgunWallet = await createRailgunWalletBase(
    encryptionKey,
    mnemonic,
    0
  );

  console.log("3");

  const publicViewingKey = await getWalletShareableViewingKey(
    railgunWallet.id
  )!;

  console.log("4");

  // Save encrypted wallet to file (including the salt for Railgun encryption)
  saveEncryptedWallet(
    mnemonic,
    railgunWallet.id,
    railgunEncryptionSalt.toString("hex"),
    password
  );

  console.log("5");

  // Store in memory
  currentWallet = {
    railgunId: railgunWallet.id,
    railgunAddress: railgunWallet.railgunAddress,
    publicViewingKey: publicViewingKey,
  };

  return currentWallet;
}

/** Unlock wallet with password */
export async function unlockWalletWithPassword(password: string) {
  const { mnemonic, railgunId, railgunEncryptionSalt } =
    loadEncryptedWallet(password);

  // Derive the same encryption key using the saved salt
  const salt = Buffer.from(railgunEncryptionSalt, "hex");
  const encryptionKey = deriveKeyFromPassword(password, salt).toString("hex");

  // Load wallet from Railgun storage
  const { id, railgunAddress } = await loadWalletByID(
    encryptionKey,
    railgunId,
    false
  );

  const publicViewingKey = await getWalletShareableViewingKey(id)!;

  // Store in memory
  currentWallet = {
    railgunId: id,
    railgunAddress: railgunAddress,
    publicViewingKey: publicViewingKey,
  };

  return currentWallet;
}

/** Check if wallet is unlocked */
export function isWalletUnlocked(): boolean {
  return currentWallet !== null;
}

/** Get current wallet address (or ID) */
export function getWalletAddress(): string {
  if (!currentWallet) {
    throw new Error("Wallet is locked");
  }
  return currentWallet.railgunAddress;
}

/** Get current wallet ID */
export function getWalletId(): string {
  if (!currentWallet) {
    throw new Error("Wallet is locked");
  }
  return currentWallet.railgunId;
}

/** create a wallet from a mnemonic */
export async function createWallet(mnemonic: string, encryptionKey: string) {
  const railgunWallet = await createRailgunWalletBase(
    encryptionKey,
    mnemonic,
    0
  );

  const publicViewingKey = await getWalletShareableViewingKey(
    railgunWallet.id
  )!;

  return {
    mnemonic,
    encryptionKey,
    railgunId: railgunWallet.id,
    railgunAddress: railgunWallet.railgunAddress,
    publicViewingKey: publicViewingKey,
  };
}

/** generate a random wallet */
export async function generateRandomWallet() {
  const mnemonic = Wallet.createRandom().mnemonic!.phrase;
  const encryptionKey = randomBytes(32).toString("hex");
  return createWallet(mnemonic, encryptionKey);
}

/** load a wallet from a storage */
export async function loadWallet(railgunId: string, encryptionKey: string) {
  const { id, railgunAddress } = await loadWalletByID(
    encryptionKey,
    railgunId,
    false
  );
  const publicViewingKey = await getWalletShareableViewingKey(id)!;
  return {
    railgunId: id,
    railgunAddress: railgunAddress,
    publicViewingKey: publicViewingKey,
  };
}
