import {
  getMediaNetworkUrl,
  mediaManifest,
  type MediaAsset,
  type MediaManifest,
} from "./media-manifest";

const DOWNLOAD_CONCURRENCY = 1;
const DOWNLOAD_RETRY_LIMIT = 2;
const DOWNLOAD_ERROR_MESSAGE =
  "영상 및 음성 데이터를 다운로드하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.";

type DownloadMediaAssetsOptions = {
  existingBlobs?: Map<string, Blob>;
  fetchAsset?: typeof fetch;
  manifest?: MediaManifest;
  onProgress?: (downloadedBytes: number) => void;
  resolveUrl?: (source: string) => string | undefined;
  retryDelay?: (milliseconds: number, signal: AbortSignal) => Promise<void>;
  signal: AbortSignal;
};

export function waitForDownloadRetry(
  milliseconds: number,
  signal: AbortSignal,
) {
  return new Promise<void>((resolve, reject) => {
    function handleAbort() {
      clearTimeout(timer);
      reject(new DOMException("Download aborted", "AbortError"));
    }

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

async function downloadAsset(
  asset: MediaAsset,
  {
    fetchAsset,
    resolveUrl,
    retryDelay,
    signal,
  }: Required<
    Pick<
      DownloadMediaAssetsOptions,
      "fetchAsset" | "resolveUrl" | "retryDelay" | "signal"
    >
  >,
) {
  const networkUrl = resolveUrl(asset.source);
  if (!networkUrl) {
    throw new Error(`미디어 주소가 없습니다: ${asset.source}`);
  }

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt <= DOWNLOAD_RETRY_LIMIT;
    attempt += 1
  ) {
    signal.throwIfAborted();

    try {
      const response = await fetchAsset(networkUrl, {
        cache: "default",
        mode: "cors",
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size !== asset.size) {
        throw new Error(
          `Size mismatch: expected ${asset.size}, received ${blob.size}`,
        );
      }

      return blob;
    } catch (error) {
      if (signal.aborted) throw error;
      lastError = error;
    }

    if (attempt < DOWNLOAD_RETRY_LIMIT) {
      await retryDelay(500 * 2 ** attempt, signal);
    }
  }

  throw new Error(DOWNLOAD_ERROR_MESSAGE, { cause: lastError });
}

export async function downloadMediaAssets({
  existingBlobs = new Map(),
  fetchAsset = fetch,
  manifest = mediaManifest,
  onProgress = () => undefined,
  resolveUrl = getMediaNetworkUrl,
  retryDelay = waitForDownloadRetry,
  signal,
}: DownloadMediaAssetsOptions) {
  let nextAssetIndex = 0;
  let transferredBytes = Array.from(existingBlobs.values()).reduce(
    (total, blob) => total + blob.size,
    0,
  );
  onProgress(transferredBytes);

  async function downloadNext() {
    while (nextAssetIndex < manifest.assets.length) {
      const asset = manifest.assets[nextAssetIndex++];
      if (existingBlobs.has(asset.key)) continue;

      const blob = await downloadAsset(asset, {
        fetchAsset,
        resolveUrl,
        retryDelay,
        signal,
      });
      signal.throwIfAborted();

      existingBlobs.set(asset.key, blob);
      transferredBytes += blob.size;
      onProgress(
        Math.min(transferredBytes, manifest.totalBytes),
      );
    }
  }

  const workerCount = Math.min(
    DOWNLOAD_CONCURRENCY,
    manifest.assets.length,
  );
  await Promise.all(
    Array.from({ length: workerCount }, () => downloadNext()),
  );
  onProgress(manifest.totalBytes);

  return existingBlobs;
}
