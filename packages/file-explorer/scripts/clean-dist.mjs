import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");

await rm(distDir, { recursive: true, force: true });
