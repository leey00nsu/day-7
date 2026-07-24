import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEO_DIRECTORY = path.resolve(process.cwd(), "../outputs/videos");

function resolveVideo(filename: string) {
  const safeFilename = path.basename(filename);

  if (safeFilename !== filename || !safeFilename.endsWith(".mp4")) {
    return null;
  }

  return path.join(VIDEO_DIRECTORY, safeFilename);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename } = await context.params;
  const videoPath = resolveVideo(filename);

  if (!videoPath) {
    return new Response(null, { status: 404 });
  }

  let videoStat;

  try {
    videoStat = await stat(videoPath);
  } catch {
    return new Response(null, { status: 404 });
  }

  const range = request.headers.get("range");
  const commonHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
    "Content-Type": "video/mp4",
  };

  if (!range) {
    const stream = Readable.toWeb(createReadStream(videoPath));

    return new Response(stream as ReadableStream, {
      headers: {
        ...commonHeaders,
        "Content-Length": String(videoStat.size),
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);

  if (!match) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${videoStat.size}` },
    });
  }

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2]
    ? Math.min(Number(match[2]), videoStat.size - 1)
    : videoStat.size - 1;

  if (start > end || start >= videoStat.size) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${videoStat.size}` },
    });
  }

  const stream = Readable.toWeb(createReadStream(videoPath, { start, end }));

  return new Response(stream as ReadableStream, {
    status: 206,
    headers: {
      ...commonHeaders,
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${videoStat.size}`,
    },
  });
}
