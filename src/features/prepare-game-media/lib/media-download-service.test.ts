import { describe, expect, it, vi } from "vitest";

import { downloadMediaAssets } from "./media-download-service";
import type { MediaManifest } from "../model/media-manifest";

const manifest: MediaManifest = {
  totalBytes: 5,
  assets: [
    { key: "first", size: 2, source: "/first.mp3" },
    { key: "second", size: 3, source: "/second.mp3" },
  ],
};

const noRetryDelay = () => Promise.resolve();

describe("media download service", () => {
  it("downloads validated assets and reports progress", async () => {
    const progress: number[] = [];
    const fetchAsset = vi
      .fn()
      .mockResolvedValueOnce(new Response(new Blob(["12"])))
      .mockResolvedValueOnce(new Response(new Blob(["345"])));

    const blobs = await downloadMediaAssets({
      fetchAsset,
      manifest,
      onProgress: (bytes) => progress.push(bytes),
      resolveUrl: (source) => `https://media.example${source}`,
      retryDelay: noRetryDelay,
      signal: new AbortController().signal,
    });

    expect([...blobs.keys()]).toEqual(["first", "second"]);
    expect(fetchAsset).toHaveBeenCalledTimes(2);
    expect(progress).toEqual([0, 2, 5, 5]);
  });

  it("continues from already downloaded blobs", async () => {
    const fetchAsset = vi
      .fn()
      .mockResolvedValue(new Response(new Blob(["345"])));

    const blobs = await downloadMediaAssets({
      existingBlobs: new Map([["first", new Blob(["12"])]]),
      fetchAsset,
      manifest,
      resolveUrl: (source) => source,
      retryDelay: noRetryDelay,
      signal: new AbortController().signal,
    });

    expect(blobs.size).toBe(2);
    expect(fetchAsset).toHaveBeenCalledTimes(1);
  });

  it("retries invalid downloads and returns a useful error", async () => {
    const fetchAsset = vi
      .fn()
      .mockResolvedValue(new Response(new Blob(["wrong-size"])));

    await expect(
      downloadMediaAssets({
        fetchAsset,
        manifest: {
          assets: [manifest.assets[0]],
          totalBytes: 2,
        },
        resolveUrl: (source) => source,
        retryDelay: noRetryDelay,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow(
      "영상 및 음성 데이터를 다운로드하지 못했습니다.",
    );
    expect(fetchAsset).toHaveBeenCalledTimes(3);
  });
});
