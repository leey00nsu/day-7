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

import {
  MediaDeletePrompt,
  MediaDownloadProgress,
  MediaDownloadPrompt,
} from "@/features/media/components/MediaAssetDialogs";
import { downloadMediaAssets } from "@/features/media/media-download-service";
import {
  getMediaAssetKey,
  getMediaNetworkUrl,
  requiresDownloadedPlayback,
} from "@/features/media/media-manifest";

const STORAGE_CHOICE_KEY = "game-media-storage-choice";

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
  downloadRequired: boolean;
  requestDownload: () => void;
  requestDelete: () => void;
  resolveAssetUrl: (source?: string) => string | undefined;
  selectStreaming: () => void;
  storageMode: StorageMode;
};

const fallbackContext: MediaAssetContextValue = {
  cachedDataAvailable: false,
  downloadRequired: false,
  requestDownload() {},
  requestDelete() {},
  resolveAssetUrl: getMediaNetworkUrl,
  selectStreaming() {},
  storageMode: "stream",
};

const MediaAssetContext =
  createContext<MediaAssetContextValue>(fallbackContext);

export function MediaAssetProvider({ children }: { children: ReactNode }) {
  const objectUrlsRef = useRef<string[]>([]);
  const downloadedBlobsRef = useRef(new Map<string, Blob>());
  const abortControllerRef = useRef<AbortController | null>(null);
  const [appReady, setAppReady] = useState(false);
  const [downloadRequired, setDownloadRequired] = useState(false);
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
    async () => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setDownloadError(undefined);
      setGateState("downloading");

      try {
        const blobs = await downloadMediaAssets({
          existingBlobs: downloadedBlobsRef.current,
          onProgress: setDownloadedBytes,
          signal: controller.signal,
        });

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
    if (downloadRequired) {
      setAppReady(false);
      setDownloadError(undefined);
      setDownloadedBytes(0);
      setGateState("prompt");
      return;
    }

    abortControllerRef.current?.abort();
    downloadedBlobsRef.current.clear();
    window.localStorage.setItem(STORAGE_CHOICE_KEY, "stream");
    setStorageMode("stream");
    setAppReady(true);
    setGateState("ready");
  }, [downloadRequired]);

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
    setAppReady(!downloadRequired);
    setGateState(downloadRequired ? "prompt" : "ready");
  }, [downloadRequired, revokeObjectUrls]);

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
      const mustDownload = requiresDownloadedPlayback();
      const choice = window.localStorage.getItem(STORAGE_CHOICE_KEY);
      setDownloadRequired(mustDownload);

      if (!mustDownload && choice === "stream") {
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

      if (cancelled) return;
      setStorageMode("stream");
      setCachedDataAvailable(false);
      setDownloadedBytes(0);
      setGateState("prompt");
    }

    initialize();

    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();
      revokeObjectUrls();
      downloadedBlobsRef.current.clear();
    };
  }, [revokeObjectUrls]);

  const contextValue = useMemo<MediaAssetContextValue>(
    () => ({
      cachedDataAvailable,
      downloadRequired,
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
          ? assetUrls.get(getMediaAssetKey(source))
          : getMediaNetworkUrl(source);
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
      downloadRequired,
      storageMode,
    ],
  );

  if (!appReady && gateState === "checking") {
    return <div aria-hidden="true" className="fixed inset-0 z-[210] bg-black" />;
  }

  if (!appReady && gateState === "prompt") {
    return (
      <MediaDownloadPrompt
        downloadRequired={downloadRequired}
        onDownload={() => void startDownload()}
        onStream={chooseStreaming}
      />
    );
  }

  if (!appReady && gateState === "deletePrompt") {
    return (
      <MediaDeletePrompt
        deleting={deleting}
        downloadRequired={downloadRequired}
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
        allowStreaming={!downloadRequired}
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
          downloadRequired={downloadRequired}
          onDownload={() => void startDownload()}
          onStream={chooseStreaming}
        />
      ) : null}
      {gateState === "deletePrompt" ? (
        <MediaDeletePrompt
          deleting={deleting}
          downloadRequired={downloadRequired}
          error={deleteError}
          onCancel={() => setGateState("ready")}
          onDelete={() => void deleteDownloadedAssets()}
        />
      ) : null}
      {gateState === "downloading" || gateState === "error" ? (
        <MediaDownloadProgress
          allowStreaming={!downloadRequired}
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
    downloadRequired,
    requestDelete,
    requestDownload,
    selectStreaming,
    storageMode,
  } = useContext(MediaAssetContext);

  return {
    cachedDataAvailable,
    downloadRequired,
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
      downloadRequired: false,
      requestDelete() {},
      requestDownload() {},
      resolveAssetUrl: getMediaNetworkUrl,
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
