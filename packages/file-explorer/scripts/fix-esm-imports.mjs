import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

const isRelativeSpecifier = (value) =>
  value.startsWith("./") || value.startsWith("../");

const hasKnownExtension = (value) =>
  [".js", ".mjs", ".cjs", ".json", ".css", ".d.ts"].some((ext) =>
    value.endsWith(ext),
  );

const resolveSpecifier = (filePath, specifier, extension) => {
  const absoluteTarget = path.resolve(path.dirname(filePath), specifier);

  if (existsSync(absoluteTarget) && statSync(absoluteTarget).isDirectory()) {
    return `${specifier}/index${extension}`;
  }

  return `${specifier}${extension}`;
};

const rewriteSpecifiers = (source, filePath, extension) =>
  source.replace(
    /(from\s+["']|export\s+\*\s+from\s+["']|export\s+\{[^}]+\}\s+from\s+["']|import\s*\(\s*["'])([^"']+)(["'])/g,
    (match, prefix, specifier, suffix) => {
      if (!isRelativeSpecifier(specifier) || hasKnownExtension(specifier)) {
        return match;
      }

      return `${prefix}${resolveSpecifier(filePath, specifier, extension)}${suffix}`;
    },
  );

const processFile = async (filePath) => {
  const raw = await readFile(filePath, "utf8");
  const isDeclarationFile = filePath.endsWith(".d.ts");
  const ext = path.extname(filePath);

  let next = raw;
  if (ext === ".js") {
    next = rewriteSpecifiers(raw, filePath, ".js");
  } else if (isDeclarationFile) {
    next = rewriteSpecifiers(raw, filePath, ".js");
  }

  if (next !== raw) {
    await writeFile(filePath, next);
  }
};

const walk = async (dirPath) => {
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await walk(entryPath);
      continue;
    }

    if (entryPath.endsWith(".js") || entryPath.endsWith(".d.ts")) {
      await processFile(entryPath);
    }
  }
};

await walk(distDir);
