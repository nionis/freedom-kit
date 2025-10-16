import { join } from "node:path";
import { homedir } from "node:os";

const GHOST_FOLDER_NAME = "original";
const GHOST_ZIP_NAME = "original.zip";

export const LOC_ROOT = join(__dirname, "..");
export const BIN_ROOT = join(__dirname, "..");
export const HOM_ROOT = join(homedir(), ".ghost-freedom-kit");

export const LOC_GHOST_FOLDER = join(LOC_ROOT, GHOST_FOLDER_NAME);
export const BIN_GHOST_FOLDER = join(HOM_ROOT, GHOST_FOLDER_NAME);

export const LOC_GHOST_ZIP = join(LOC_ROOT, GHOST_ZIP_NAME);
export const BIN_GHOST_ZIP = join(BIN_ROOT, GHOST_ZIP_NAME);

export const BIN_GHOST_CONFIG = join(
  BIN_GHOST_FOLDER,
  "config.production.json"
);
