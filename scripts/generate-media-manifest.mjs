import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, "public");
const outputPath = path.join(
  projectRoot,
  "src",
  "features",
  "prepare-game-media",
  "config",
  "media-manifest.json",
);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

const videoFiles = (await listFiles(path.join(publicRoot, "videos"))).filter(
  (file) => file.endsWith(".mp4"),
);
const audioFiles = (await listFiles(path.join(publicRoot, "audio"))).filter(
  (file) =>
    file.endsWith(".mp3") &&
    !file.endsWith(path.join("audio", "trailer-top-flow.mp3")),
);
const files = [...videoFiles, ...audioFiles].sort();

const assets = await Promise.all(
  files.map(async (file) => {
    const relativePath = path.relative(publicRoot, file).split(path.sep).join("/");
    const fileBuffer = await readFile(file);
    const fileStat = await stat(file);
    const isVideo = relativePath.startsWith("videos/");
    const source = isVideo
      ? relativePath.slice("videos/".length)
      : `/${relativePath}`;
    const key = isVideo ? `video/${source}` : relativePath;

    return {
      key,
      source,
      cacheName: key.replaceAll("/", "__"),
      size: fileStat.size,
      sha256: createHash("sha256").update(fileBuffer).digest("hex"),
    };
  }),
);

const digest = createHash("sha256")
  .update(JSON.stringify(assets))
  .digest("hex")
  .slice(0, 12);
const manifest = {
  version: `2026-07-26-${digest}`,
  totalBytes: assets.reduce((total, asset) => total + asset.size, 0),
  assets,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Wrote ${assets.length} assets (${(
    manifest.totalBytes /
    1024 /
    1024
  ).toFixed(2)} MiB) to ${outputPath}`,
);
