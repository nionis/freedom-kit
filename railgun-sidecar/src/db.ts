// copied from railgun-community/wallet
import type { AbstractLevelDOWN } from "abstract-leveldown";
import { ClassicLevel } from "classic-level";

export const createNodeDatabase = (
  dbLocationPath: string
): AbstractLevelDOWN => {
  console.log("Creating local database at path: ", dbLocationPath);
  const db = new ClassicLevel(dbLocationPath, { valueEncoding: "json" });
  // @ts-ignore
  db.isOperational = () => db.status === "open";
  return db as unknown as AbstractLevelDOWN;
};
