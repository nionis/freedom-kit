import archiver from "archiver";
import fs from "fs";
import { LOC_GHOST_FOLDER, LOC_GHOST_ZIP } from "./utils";

async function compressFolder(
  sourceDir: string,
  outPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`Archive created: ${archive.pointer()} bytes`);
      resolve();
    });

    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

compressFolder(LOC_GHOST_FOLDER, LOC_GHOST_ZIP);
