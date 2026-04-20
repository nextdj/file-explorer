import { watch } from "node:fs";
import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourceFile = resolve(process.cwd(), "src/styles/theme.css");
const targetFile = resolve(process.cwd(), "dist/styles/theme.css");

const copyTheme = async () => {
  await mkdir(dirname(targetFile), { recursive: true });
  await cp(sourceFile, targetFile);
  console.log("[file-explorer] synced theme.css");
};

await copyTheme();

watch(sourceFile, async () => {
  try {
    await copyTheme();
  } catch (error) {
    console.error("[file-explorer] failed to sync theme.css", error);
  }
});

await new Promise(() => undefined);
