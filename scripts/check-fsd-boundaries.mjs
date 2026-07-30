import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourceRoot = path.resolve("src");
const layerRank = new Map([
  ["shared", 0],
  ["entities", 1],
  ["features", 2],
  ["widgets", 3],
  ["_pages", 4],
  ["_app", 5],
  ["app", 6],
]);
const slicedLayers = new Set([
  "entities",
  "features",
  "widgets",
  "_pages",
]);
const sourceExtensions = new Set([".ts", ".tsx"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(entryPath);
      return sourceExtensions.has(path.extname(entry.name))
        ? [entryPath]
        : [];
    }),
  );

  return files.flat();
}

function describeModule(parts) {
  const layer = parts[0];
  if (!layerRank.has(layer)) return null;

  return {
    layer,
    rank: layerRank.get(layer),
    slice: slicedLayers.has(layer) ? parts[1] : undefined,
  };
}

function isPublicImport(importPath, target, source) {
  if (target.layer === "app" || target.layer === "_app") return true;
  if (target.layer === "generated") return true;

  if (
    source.layer === target.layer &&
    source.slice === target.slice
  ) {
    return true;
  }

  if (target.layer === "shared") {
    return /^@\/shared\/(?:config|api\/database|lib\/cn|ui\/button)$/.test(
      importPath,
    );
  }

  const sliceRoot = `@/${target.layer}/${target.slice}`;
  if (importPath === sliceRoot) return true;

  return (
    target.layer === "features" &&
    target.slice === "game-reporting" &&
    (importPath === `${sliceRoot}/server` ||
      importPath === `${sliceRoot}/testing`)
  );
}

function findAliasImports(sourceText) {
  const imports = [];
  const importPattern =
    /\bfrom\s+["'](@\/[^"']+)["']|\bimport\s+["'](@\/[^"']+)["']/g;

  for (const match of sourceText.matchAll(importPattern)) {
    imports.push({
      path: match[1] ?? match[2],
      offset: match.index,
    });
  }

  return imports;
}

function lineNumberAt(sourceText, offset) {
  return sourceText.slice(0, offset).split("\n").length;
}

const violations = [];
const files = await collectSourceFiles(sourceRoot);

for (const file of files) {
  const relativeFile = path.relative(sourceRoot, file);
  const source = describeModule(relativeFile.split(path.sep));
  if (!source) continue;

  const sourceText = await readFile(file, "utf8");
  for (const imported of findAliasImports(sourceText)) {
    const targetParts = imported.path.slice(2).split("/");
    const target = describeModule(targetParts);
    if (!target) continue;

    const location = `${relativeFile}:${lineNumberAt(
      sourceText,
      imported.offset,
    )}`;

    if (source.rank < target.rank) {
      violations.push(
        `${location} cannot import higher layer ${imported.path}`,
      );
      continue;
    }

    if (
      source.layer === target.layer &&
      source.slice &&
      target.slice &&
      source.slice !== target.slice
    ) {
      violations.push(
        `${location} cannot import sibling slice ${imported.path}`,
      );
      continue;
    }

    if (!isPublicImport(imported.path, target, source)) {
      violations.push(
        `${location} must use the public API for ${imported.path}`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error("FSD boundary violations:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exitCode = 1;
} else {
  console.log("FSD boundaries are valid.");
}
