"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Download, HardDrive, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import mediaManifestJson from "@/data/media-manifest.json";
import { getVideoUrl } from "@/lib/video";

const STORAGE_CHOICE_KEY = "game-media-storage-choice";
const DOWNLOAD_CONCURRENCY = 1;
const DOWNLOAD_RETRY_LIMIT = 2;
const DOWNLOAD_ERROR_MESSAGE =
  "영상 및 음성 데이터를 다운로드하지 못했습니다. 잠시 후 다시 시도하거나 스트리밍으로 진행해 주세요.";

type MediaAsset = {
  key: string;
  source: string;
  size: number;
};

type MediaManifest = {
  totalBytes: number;
  assets: MediaAsset[];
};

type StorageMode = "download" | "stream";
type GateState =
  | "checking"
  | "prompt"
  | "deletePrompt"
  | "downloading"
  | "restoring"
  | "ready"
  | "error";

type MediaAssetContextValue = {
  cachedDataAvailable: boolean;
  requestDownload: () => void;
  requestDelete: () => void;
  resolveAssetUrl: (source?: string) => string | undefined;
  selectStreaming: () => void;
  storageMode: StorageMode;
};

const manifest = mediaManifestJson as MediaManifest;

function getAssetKey(source: string) {
  if (source.startsWith("/audio/")) return source.slice(1);
  if (source.endsWith(".mp4")) return `video/${source}`;
  return source;
}

function getNetworkUrl(source?: string) {
  if (!source) return undefined;
  if (source.startsWith("/")) return source;
  return getVideoUrl(source);
}

const fallbackContext: MediaAssetContextValue = {
  cachedDataAvailable: false,
  requestDownload() {},
  requestDelete() {},
  resolveAssetUrl: getNetworkUrl,
  selectStreaming() {},
  storageMode: "stream",
};

const MediaAssetContext =
  createContext<MediaAssetContextValue>(fallbackContext);

function formatMegabytes(bytes: number) {
  return `${Math.ceil(bytes / 1_000_000)}MB`;
}

function waitForDownloadRetry(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    function handleAbort() {
      window.clearTimeout(timer);
      reject(new DOMException("Download aborted", "AbortError"));
    }

    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve();
    }, delay);

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

export function MediaDownloadPrompt({
  onDownload,
  onStream,
}: {
  onDownload: () => void;
  onStream: () => void;
}) {
  return (
    <section
      aria-labelledby="media-download-title"
      aria-modal="true"
      className="fixed inset-0 z-[210] grid place-items-center bg-black px-5 text-center text-white"
      role="dialog"
    >
      <div className="max-w-lg">
        <HardDrive
          aria-hidden="true"
          className="mx-auto mb-6 size-9 text-white/72"
        />
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          id="media-download-title"
        >
          영상 및 음성 데이터를 미리 다운로드 할까요?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/62 sm:text-base">
          원활한 재생을 위해 영상과 음성 약{" "}
          {formatMegabytes(manifest.totalBytes)}를 현재 탭에 미리
          다운로드합니다. 탭을 닫거나 새로고침하면 준비한 데이터는
          삭제됩니다. 다운로드하지 않더라도 스트리밍으로 진행할 수 있으며
          지연이 발생할 수 있습니다.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            className="min-w-44"
            data-sound="none"
            onClick={onDownload}
            size="lg"
            variant="outline"
          >
            <Download data-icon="inline-start" />
            다운로드하고 시작
          </Button>
          <Button
            className="min-w-44"
            data-sound="none"
            onClick={onStream}
            size="lg"
            variant="outline"
          >
            <Wifi data-icon="inline-start" />
            스트리밍으로 시작
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MediaDeletePrompt({
  deleting = false,
  error,
  onCancel,
  onDelete,
}: {
  deleting?: boolean;
  error?: string;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <section
      aria-labelledby="media-delete-title"
      aria-modal="true"
      className="fixed inset-0 z-[210] grid place-items-center bg-black px-5 text-center text-white"
      role="dialog"
    >
      <div className="max-w-lg">
        <HardDrive
          aria-hidden="true"
          className="mx-auto mb-6 size-9 text-white/72"
        />
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          id="media-delete-title"
        >
          영상 및 음성 데이터를 삭제할까요?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/62 sm:text-base">
          현재 탭에 미리 준비한 데이터를 삭제합니다. 삭제한 뒤에도
          스트리밍으로 진행할 수 있으며 지연이 발생할 수 있습니다.
        </p>
        {error ? (
          <p className="mt-4 text-sm font-medium text-red-300">{error}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            className="min-w-36"
            data-sound="none"
            disabled={deleting}
            onClick={onDelete}
            size="lg"
            variant="outline"
          >
            {deleting ? "삭제 중" : "삭제"}
          </Button>
          <Button
            className="min-w-36"
            data-sound="none"
            disabled={deleting}
            onClick={onCancel}
            size="lg"
            variant="outline"
          >
            취소
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MediaDownloadProgress({
  downloadedBytes,
  error,
  onRetry,
  onStream,
}: {
  downloadedBytes: number;
  error?: string;
  onRetry: () => void;
  onStream: () => void;
}) {
  const progress = Math.min(
    Math.round((downloadedBytes / manifest.totalBytes) * 100),
    100,
  );

  return (
    <section
      aria-live="polite"
      className="fixed inset-0 z-[210] grid place-items-center bg-black px-5 text-center text-white"
    >
      <div className="w-full max-w-md">
        <Download
          aria-hidden="true"
          className="mx-auto mb-6 size-9 text-white/72"
        />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {error ? "다운로드하지 못했습니다" : "게임 데이터 준비 중"}
        </h1>
        {error ? (
          <>
            <p className="mt-4 text-sm leading-6 text-red-200">{error}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button
                className="min-w-36"
                data-sound="none"
                onClick={onRetry}
                size="lg"
                variant="outline"
              >
                다시 시도
              </Button>
              <Button
                className="min-w-36"
                data-sound="none"
                onClick={onStream}
                size="lg"
                variant="outline"
              >
                스트리밍으로 시작
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between text-xs tabular-nums text-white/52">
              <span>{progress}%</span>
              <span>
                {formatMegabytes(downloadedBytes)} /{" "}
                {formatMegabytes(manifest.totalBytes)}
              </span>
            </div>
            <p className="mt-5 text-sm text-white/48">
              화면을 닫지 말고 잠시 기다려 주세요.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export function MediaAssetProvider({ children }: { children: ReactNode }) {
  const objectUrlsRef = useRef<string[]>([]);
  const downloadedBlobsRef = useRef(new Map<string, Blob>());
  const abortControllerRef = useRef<AbortController | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [gateState, setGateState] = useState<GateState>("checking");
  const [storageMode, setStorageMode] = useState<StorageMode>("stream");
  const [cachedDataAvailable, setCachedDataAvailable] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string>();
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [downloadError, setDownloadError] = useState<string>();
  const [assetUrls, setAssetUrls] = useState<Map<string, string>>(
    () => new Map(),
  );

  const revokeObjectUrls = useCallback(() => {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];
  }, []);

  const activateDownloadedBlobs = useCallback(
    (blobs: Map<string, Blob>) => {
      revokeObjectUrls();

      const urls = new Map<string, string>();
      for (const [key, blob] of blobs) {
        const url = URL.createObjectURL(blob);
        objectUrlsRef.current.push(url);
        urls.set(key, url);
      }

      setAssetUrls(urls);
      setCachedDataAvailable(true);
      setStorageMode("download");
      setAppReady(true);
      setGateState("ready");
    },
    [revokeObjectUrls],
  );

  const startDownload = useCallback(
    async ({ quiet = false }: { quiet?: boolean } = {}) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setDownloadError(undefined);
      setGateState(quiet ? "restoring" : "downloading");

      try {
        let nextAssetIndex = 0;
        const blobs = downloadedBlobsRef.current;
        let transferredBytes = Array.from(blobs.values()).reduce(
          (total, blob) => total + blob.size,
          0,
        );
        setDownloadedBytes(transferredBytes);
        const workerCount = Math.min(
          DOWNLOAD_CONCURRENCY,
          manifest.assets.length,
        );

        async function downloadNext() {
          while (nextAssetIndex < manifest.assets.length) {
            const asset = manifest.assets[nextAssetIndex++];
            if (blobs.has(asset.key)) continue;

            const networkUrl = getNetworkUrl(asset.source);
            if (!networkUrl) {
              throw new Error(`미디어 주소가 없습니다: ${asset.source}`);
            }

            let blob: Blob | undefined;
            let lastError: unknown;

            for (
              let attempt = 0;
              attempt <= DOWNLOAD_RETRY_LIMIT;
              attempt += 1
            ) {
              try {
                const response = await fetch(networkUrl, {
                  cache: "default",
                  mode: "cors",
                  signal: controller.signal,
                });

                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`);
                }

                const downloadedBlob = await response.blob();
                if (downloadedBlob.size !== asset.size) {
                  throw new Error(
                    `Size mismatch: expected ${asset.size}, received ${downloadedBlob.size}`,
                  );
                }

                blob = downloadedBlob;
                break;
              } catch (error) {
                lastError = error;
              }

              if (controller.signal.aborted) return;
              if (attempt < DOWNLOAD_RETRY_LIMIT) {
                await waitForDownloadRetry(
                  500 * 2 ** attempt,
                  controller.signal,
                );
              }
            }

            if (!blob) {
              console.error(`Failed to download ${asset.source}`, lastError);
              throw new Error(DOWNLOAD_ERROR_MESSAGE);
            }
            if (controller.signal.aborted) return;

            blobs.set(asset.key, blob);
            transferredBytes += blob.size;
            setDownloadedBytes(
              Math.min(transferredBytes, manifest.totalBytes),
            );
          }
        }

        await Promise.all(
          Array.from({ length: workerCount }, () => downloadNext()),
        );
        setDownloadedBytes(manifest.totalBytes);

        if (controller.signal.aborted) return;

        window.localStorage.setItem(STORAGE_CHOICE_KEY, "download");
        activateDownloadedBlobs(blobs);
        downloadedBlobsRef.current = new Map();
      } catch (error) {
        if (controller.signal.aborted) return;

        setDownloadError(
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
        );
        setGateState("error");
      }
    },
    [activateDownloadedBlobs],
  );

  const chooseStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    downloadedBlobsRef.current.clear();
    window.localStorage.setItem(STORAGE_CHOICE_KEY, "stream");
    setStorageMode("stream");
    setAppReady(true);
    setGateState("ready");
  }, []);

  const deleteDownloadedAssets = useCallback(() => {
    abortControllerRef.current?.abort();
    setDeleting(true);
    setDeleteError(undefined);

    revokeObjectUrls();
    downloadedBlobsRef.current.clear();
    window.localStorage.setItem(STORAGE_CHOICE_KEY, "stream");
    setAssetUrls(new Map());
    setCachedDataAvailable(false);
    setStorageMode("stream");
    setDeleting(false);
    setGateState("ready");
  }, [revokeObjectUrls]);

  const chooseDownloadedPlayback = useCallback(() => {
    if (!cachedDataAvailable) {
      setDownloadError(undefined);
      setDownloadedBytes(0);
      setGateState("prompt");
      return;
    }

    window.localStorage.setItem(STORAGE_CHOICE_KEY, "download");
    setStorageMode("download");
    setGateState("ready");
  }, [cachedDataAvailable]);

  useEffect(() => {
    let cancelled = false;

    function initialize() {
      const choice = window.localStorage.getItem(STORAGE_CHOICE_KEY);

      if (choice === "stream") {
        if (cancelled) return;
        setStorageMode("stream");
        setAppReady(true);
        setGateState("ready");
        return;
      }

      if (choice !== "download") {
        setGateState("prompt");
        return;
      }

      if (!cancelled) void startDownload({ quiet: true });
    }

    initialize();

    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();
      revokeObjectUrls();
      downloadedBlobsRef.current.clear();
    };
  }, [revokeObjectUrls, startDownload]);

  const contextValue = useMemo<MediaAssetContextValue>(
    () => ({
      cachedDataAvailable,
      requestDownload() {
        void chooseDownloadedPlayback();
      },
      requestDelete() {
        setDeleteError(undefined);
        setGateState("deletePrompt");
      },
      resolveAssetUrl(source) {
        if (!source) return undefined;

        return storageMode === "download"
          ? assetUrls.get(getAssetKey(source))
          : getNetworkUrl(source);
      },
      selectStreaming() {
        chooseStreaming();
      },
      storageMode,
    }),
    [
      assetUrls,
      cachedDataAvailable,
      chooseDownloadedPlayback,
      chooseStreaming,
      storageMode,
    ],
  );

  if (!appReady && gateState === "checking") {
    return <div aria-hidden="true" className="fixed inset-0 z-[210] bg-black" />;
  }

  if (!appReady && gateState === "restoring") {
    return (
      <div
        aria-label="미디어 준비 중"
        className="fixed inset-0 z-[210] grid place-items-center bg-black"
        role="status"
      >
        <span
          aria-hidden="true"
          className="size-11 animate-spin rounded-full border-[3px] border-white/20 border-t-white"
        />
      </div>
    );
  }

  if (!appReady && gateState === "prompt") {
    return (
      <MediaDownloadPrompt
        onDownload={() => void startDownload()}
        onStream={chooseStreaming}
      />
    );
  }

  if (!appReady && gateState === "deletePrompt") {
    return (
      <MediaDeletePrompt
        deleting={deleting}
        error={deleteError}
        onCancel={() => setGateState("ready")}
        onDelete={() => void deleteDownloadedAssets()}
      />
    );
  }

  if (
    !appReady &&
    (gateState === "downloading" || gateState === "error")
  ) {
    return (
      <MediaDownloadProgress
        downloadedBytes={downloadedBytes}
        error={gateState === "error" ? downloadError : undefined}
        onRetry={() => void startDownload()}
        onStream={chooseStreaming}
      />
    );
  }

  return (
    <MediaAssetContext.Provider value={contextValue}>
      {children}
      {gateState === "prompt" ? (
        <MediaDownloadPrompt
          onDownload={() => void startDownload()}
          onStream={chooseStreaming}
        />
      ) : null}
      {gateState === "deletePrompt" ? (
        <MediaDeletePrompt
          deleting={deleting}
          error={deleteError}
          onCancel={() => setGateState("ready")}
          onDelete={() => void deleteDownloadedAssets()}
        />
      ) : null}
      {gateState === "downloading" || gateState === "error" ? (
        <MediaDownloadProgress
          downloadedBytes={downloadedBytes}
          error={gateState === "error" ? downloadError : undefined}
          onRetry={() => void startDownload()}
          onStream={chooseStreaming}
        />
      ) : null}
    </MediaAssetContext.Provider>
  );
}

export function useMediaAssetUrl(source?: string) {
  return useContext(MediaAssetContext).resolveAssetUrl(source);
}

export function useMediaAssetStorage() {
  const {
    cachedDataAvailable,
    requestDelete,
    requestDownload,
    selectStreaming,
    storageMode,
  } = useContext(MediaAssetContext);

  return {
    cachedDataAvailable,
    requestDelete,
    requestDownload,
    selectStreaming,
    storageMode,
  };
}

export function MediaAssetStoragePreview({
  cachedDataAvailable = false,
  children,
  storageMode = "stream",
}: {
  cachedDataAvailable?: boolean;
  children: ReactNode;
  storageMode?: StorageMode;
}) {
  const value = useMemo<MediaAssetContextValue>(
    () => ({
      cachedDataAvailable,
      requestDelete() {},
      requestDownload() {},
      resolveAssetUrl: getNetworkUrl,
      selectStreaming() {},
      storageMode,
    }),
    [cachedDataAvailable, storageMode],
  );

  return (
    <MediaAssetContext.Provider value={value}>
      {children}
    </MediaAssetContext.Provider>
  );
}
