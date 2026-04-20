import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const sourceFile = resolve(process.cwd(), "src/styles/theme.css");
const targetFile = resolve(process.cwd(), "dist/styles/theme.css");

await mkdir(dirname(targetFile), { recursive: true });
await cp(sourceFile, targetFile);
