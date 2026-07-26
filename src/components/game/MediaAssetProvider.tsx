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
const MANIFEST_VERSION_KEY = "game-media-manifest-version";
const CACHE_ROOT_NAME = "day-7-media";
const STORAGE_MARGIN = 1.2;

type MediaAsset = {
  key: string;
  source: string;
  cacheName: string;
  size: number;
  sha256: string;
};

type MediaManifest = {
  version: string;
  totalBytes: number;
  assets: MediaAsset[];
};

type StorageMode = "download" | "stream";
type GateState =
  | "checking"
  | "prompt"
  | "deletePrompt"
  | "downloading"
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
const manifestDirectoryName = `v-${manifest.version}`;

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

function supportsOpfs() {
  return (
    typeof navigator !== "undefined" &&
    "storage" in navigator &&
    typeof navigator.storage.getDirectory === "function"
  );
}

function formatMegabytes(bytes: number) {
  return `${Math.ceil(bytes / 1_000_000)}MB`;
}

async function sha256(file: File) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer(),
  );

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function getManifestDirectory(create: boolean) {
  const root = await navigator.storage.getDirectory();
  const cacheRoot = await root.getDirectoryHandle(CACHE_ROOT_NAME, {
    create,
  });

  return cacheRoot.getDirectoryHandle(manifestDirectoryName, {
    create,
  });
}

async function removeAllDownloadedMedia() {
  if (!supportsOpfs()) return;

  const root = await navigator.storage.getDirectory();

  try {
    await root.removeEntry(CACHE_ROOT_NAME, { recursive: true });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "NotFoundError")) {
      throw error;
    }
  }
}

async function removeManifestDirectory(version: string) {
  if (!supportsOpfs() || !/^[a-zA-Z0-9._-]+$/.test(version)) return;

  try {
    const root = await navigator.storage.getDirectory();
    const cacheRoot = await root.getDirectoryHandle(CACHE_ROOT_NAME);
    await cacheRoot.removeEntry(`v-${version}`, { recursive: true });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "NotFoundError")) {
      throw error;
    }
  }
}

async function readCachedAssets() {
  const directory = await getManifestDirectory(false);
  const files = new Map<string, File>();

  for (const asset of manifest.assets) {
    const handle = await directory.getFileHandle(asset.cacheName);
    const file = await handle.getFile();

    if (file.size !== asset.size) {
      throw new Error(`캐시 크기 불일치: ${asset.source}`);
    }

    files.set(asset.key, file);
  }

  return files;
}

export function MediaDownloadPrompt({
  supported,
  onDownload,
  onStream,
}: {
  supported: boolean;
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
          원활한 재생을 위해 영상과 음성 약 40MB를 이 기기에 저장합니다.
          저장한 데이터는 브라우저 설정이나 저장 공간 상태에 따라 삭제될 수
          있습니다. 저장하지 않더라도 스트리밍으로 진행할 수 있으며 지연이
          발생할 수 있습니다.
        </p>
        {!supported ? (
          <p className="mt-4 text-sm font-medium text-red-300">
            이 브라우저에서는 기기 저장을 지원하지 않아 스트리밍으로
            재생해야 합니다.
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            className="min-w-44"
            data-sound="none"
            disabled={!supported}
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
          삭제한 뒤에도 스트리밍으로 진행할 수 있으며 지연이 발생할 수
          있습니다.
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
  const supported = supportsOpfs();

  const revokeObjectUrls = useCallback(() => {
    for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
    objectUrlsRef.current = [];
  }, []);

  const activateCachedFiles = useCallback(
    (files: Map<string, File>) => {
      revokeObjectUrls();

      const urls = new Map<string, string>();
      for (const [key, file] of files) {
        const url = URL.createObjectURL(file);
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

  const startDownload = useCallback(async () => {
    if (!supportsOpfs()) {
      setDownloadError("이 브라우저에서는 기기 저장을 지원하지 않습니다.");
      setGateState("error");
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setDownloadError(undefined);
    setDownloadedBytes(0);
    setGateState("downloading");

    try {
      const estimate = await navigator.storage.estimate();
      const availableBytes = Math.max(
        (estimate.quota ?? 0) - (estimate.usage ?? 0),
        0,
      );
      const requiredBytes = manifest.totalBytes * STORAGE_MARGIN;

      if (estimate.quota && availableBytes < requiredBytes) {
        throw new Error(
          `저장 공간이 부족합니다. 최소 ${formatMegabytes(
            requiredBytes,
          )}의 여유 공간이 필요합니다.`,
        );
      }

      await navigator.storage.persist?.().catch(() => false);

      const directory = await getManifestDirectory(true);
      let completedBytes = 0;
      const pendingAssets: MediaAsset[] = [];

      for (const asset of manifest.assets) {
        try {
          const handle = await directory.getFileHandle(asset.cacheName);
          const file = await handle.getFile();
          if (file.size !== asset.size) throw new Error("size mismatch");
          completedBytes += asset.size;
        } catch {
          pendingAssets.push(asset);
        }
      }
      setDownloadedBytes(completedBytes);

      let nextAssetIndex = 0;
      let transferredBytes = completedBytes;
      const workerCount = Math.min(3, pendingAssets.length);

      async function downloadNext() {
        while (nextAssetIndex < pendingAssets.length) {
          const asset = pendingAssets[nextAssetIndex++];
          const networkUrl = getNetworkUrl(asset.source);
          if (!networkUrl) {
            throw new Error(`미디어 주소가 없습니다: ${asset.source}`);
          }

          const response = await fetch(networkUrl, {
            cache: "no-store",
            signal: controller.signal,
          });

          if (!response.ok || !response.body) {
            throw new Error(
              `${asset.source} 다운로드에 실패했습니다 (${response.status}).`,
            );
          }

          const handle = await directory.getFileHandle(asset.cacheName, {
            create: true,
          });
          const writable = await handle.createWritable();
          const reader = response.body.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              await writable.write(value);
              transferredBytes += value.byteLength;
              setDownloadedBytes(
                Math.min(transferredBytes, manifest.totalBytes),
              );
            }
            await writable.close();
          } catch (error) {
            await writable.abort().catch(() => undefined);
            await directory
              .removeEntry(asset.cacheName)
              .catch(() => undefined);
            throw error;
          }

          const file = await handle.getFile();
          if (file.size !== asset.size || (await sha256(file)) !== asset.sha256) {
            await directory
              .removeEntry(asset.cacheName)
              .catch(() => undefined);
            throw new Error(
              `${asset.source} 파일 검증에 실패했습니다. 다시 시도해 주세요.`,
            );
          }
        }
      }

      await Promise.all(
        Array.from({ length: workerCount }, () => downloadNext()),
      );
      setDownloadedBytes(manifest.totalBytes);

      const files = await readCachedAssets();
      const previousVersion = window.localStorage.getItem(
        MANIFEST_VERSION_KEY,
      );
      window.localStorage.setItem(STORAGE_CHOICE_KEY, "download");
      window.localStorage.setItem(MANIFEST_VERSION_KEY, manifest.version);
      if (previousVersion && previousVersion !== manifest.version) {
        await removeManifestDirectory(previousVersion).catch(() => undefined);
      }
      activateCachedFiles(files);
    } catch (error) {
      if (controller.signal.aborted) return;

      setDownloadError(
        error instanceof TypeError
          ? "미디어 서버에 연결하지 못했습니다. R2 CORS 설정과 네트워크 상태를 확인해 주세요."
          : error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      );
      setGateState("error");
    }
  }, [activateCachedFiles]);

  const chooseStreaming = useCallback(async () => {
    abortControllerRef.current?.abort();
    setGateState("checking");
    revokeObjectUrls();
    if (!cachedDataAvailable) {
      await removeAllDownloadedMedia().catch(() => undefined);
      window.localStorage.removeItem(MANIFEST_VERSION_KEY);
    }
    window.localStorage.setItem(STORAGE_CHOICE_KEY, "stream");
    setAssetUrls(new Map());
    setStorageMode("stream");
    setAppReady(true);
    setGateState("ready");
  }, [cachedDataAvailable, revokeObjectUrls]);

  const deleteDownloadedAssets = useCallback(async () => {
    abortControllerRef.current?.abort();
    setDeleting(true);
    setDeleteError(undefined);

    try {
      await removeAllDownloadedMedia();
      revokeObjectUrls();
      window.localStorage.setItem(STORAGE_CHOICE_KEY, "stream");
      window.localStorage.removeItem(MANIFEST_VERSION_KEY);
      setAssetUrls(new Map());
      setCachedDataAvailable(false);
      setStorageMode("stream");
      setDeleting(false);
      setGateState("ready");
    } catch {
      setDeleting(false);
      setDeleteError(
        "저장된 데이터를 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  }, [revokeObjectUrls]);

  const chooseDownloadedPlayback = useCallback(async () => {
    if (!cachedDataAvailable) {
      setDownloadError(undefined);
      setDownloadedBytes(0);
      setGateState("prompt");
      return;
    }

    try {
      const files = await readCachedAssets();
      window.localStorage.setItem(STORAGE_CHOICE_KEY, "download");
      window.localStorage.setItem(MANIFEST_VERSION_KEY, manifest.version);
      activateCachedFiles(files);
    } catch {
      await removeAllDownloadedMedia().catch(() => undefined);
      window.localStorage.removeItem(MANIFEST_VERSION_KEY);
      setCachedDataAvailable(false);
      setDownloadError(undefined);
      setDownloadedBytes(0);
      setGateState("prompt");
    }
  }, [activateCachedFiles, cachedDataAvailable]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const choice = window.localStorage.getItem(STORAGE_CHOICE_KEY);

      if (choice === "stream") {
        try {
          const version = window.localStorage.getItem(MANIFEST_VERSION_KEY);
          if (version === manifest.version) {
            await readCachedAssets();
            if (!cancelled) setCachedDataAvailable(true);
          }
        } catch {
          await removeAllDownloadedMedia().catch(() => undefined);
          window.localStorage.removeItem(MANIFEST_VERSION_KEY);
        }
        if (cancelled) return;
        setStorageMode("stream");
        setAppReady(true);
        setGateState("ready");
        return;
      }

      if (choice !== "download" || !supportsOpfs()) {
        setGateState("prompt");
        return;
      }

      try {
        const version = window.localStorage.getItem(MANIFEST_VERSION_KEY);
        if (version !== manifest.version) throw new Error("update required");

        const files = await readCachedAssets();
        if (!cancelled) activateCachedFiles(files);
      } catch {
        if (!cancelled) void startDownload();
      }
    }

    void initialize();

    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();
      revokeObjectUrls();
    };
  }, [activateCachedFiles, revokeObjectUrls, startDownload]);

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

        return (
          assetUrls.get(getAssetKey(source)) ?? getNetworkUrl(source)
        );
      },
      selectStreaming() {
        void chooseStreaming();
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

  if (!appReady && gateState === "prompt") {
    return (
      <MediaDownloadPrompt
        onDownload={() => void startDownload()}
        onStream={chooseStreaming}
        supported={supported}
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
          supported={supported}
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
