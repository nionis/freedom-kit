import extract from "extract-zip";

export async function decompressFolder(
  zipPath: string,
  targetDir: string
): Promise<void> {
  await extract(zipPath, { dir: targetDir });
  console.log("Extraction complete");
}
