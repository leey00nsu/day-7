"use client";

import { Download, HardDrive, Wifi } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  formatMegabytes,
  mediaManifest,
} from "@/features/media/media-manifest";

export function MediaDownloadPrompt({
  downloadRequired = false,
  onDownload,
  onStream,
}: {
  downloadRequired?: boolean;
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
          {downloadRequired
            ? "영상 및 음성 데이터를 다운로드합니다"
            : "영상 및 음성 데이터를 미리 다운로드 할까요?"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/62 sm:text-base">
          원활한 재생을 위해 영상과 음성 약{" "}
          {formatMegabytes(mediaManifest.totalBytes)}를 현재 탭에 미리
          다운로드합니다. 탭을 닫거나 새로고침하면 준비한 데이터는
          삭제됩니다.{" "}
          {downloadRequired
            ? "모바일에서는 끊김 없는 재생을 위해 다운로드가 완료된 뒤 게임을 시작할 수 있습니다."
            : "다운로드하지 않더라도 스트리밍으로 진행할 수 있으며 지연이 발생할 수 있습니다."}
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
          {!downloadRequired ? (
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
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function MediaDeletePrompt({
  deleting = false,
  downloadRequired = false,
  error,
  onCancel,
  onDelete,
}: {
  deleting?: boolean;
  downloadRequired?: boolean;
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
          현재 탭에 미리 준비한 데이터를 삭제합니다.{" "}
          {downloadRequired
            ? "모바일에서 다시 게임을 시작하려면 데이터를 다시 다운로드해야 합니다."
            : "삭제한 뒤에도 스트리밍으로 진행할 수 있으며 지연이 발생할 수 있습니다."}
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
  allowStreaming = true,
  downloadedBytes,
  error,
  onRetry,
  onStream,
}: {
  allowStreaming?: boolean;
  downloadedBytes: number;
  error?: string;
  onRetry: () => void;
  onStream: () => void;
}) {
  const progress = Math.min(
    Math.round(
      (downloadedBytes / mediaManifest.totalBytes) * 100,
    ),
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
              {allowStreaming ? (
                <Button
                  className="min-w-36"
                  data-sound="none"
                  onClick={onStream}
                  size="lg"
                  variant="outline"
                >
                  스트리밍으로 시작
                </Button>
              ) : null}
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
                {formatMegabytes(mediaManifest.totalBytes)}
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
