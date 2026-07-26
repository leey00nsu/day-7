"use client";

import {
  Cog,
  HardDrive,
  House,
  MousePointerClick,
  Music,
  Subtitles,
  Volume2,
  Wifi,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getInitialCaptionSize } from "@/lib/game-preferences";
import { cn } from "@/lib/utils";

import { useMediaAssetStorage } from "./MediaAssetProvider";

type GameOptionsProps = {
  className?: string;
  defaultOpen?: boolean;
};

export function GameOptions({
  className,
  defaultOpen = false,
}: GameOptionsProps) {
  const router = useRouter();
  const {
    cachedDataAvailable,
    downloadRequired,
    requestDelete,
    requestDownload,
    selectStreaming,
    storageMode,
  } = useMediaAssetStorage();
  const [open, setOpen] = useState(defaultOpen);
  const [captions, setCaptions] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.localStorage.getItem("game-captions") !== "false",
  );
  const [captionSize, setCaptionSize] = useState(getInitialCaptionSize);
  const [volume, setVolume] = useState(() =>
    typeof window === "undefined"
      ? 80
      : Number(window.localStorage.getItem("game-volume") ?? 80),
  );
  const [musicVolume, setMusicVolume] = useState(() =>
    typeof window === "undefined"
      ? 28
      : Number(window.localStorage.getItem("game-music-volume") ?? 28),
  );
  const [effectsVolume, setEffectsVolume] = useState(() =>
    typeof window === "undefined"
      ? 40
      : Number(window.localStorage.getItem("game-effects-volume") ?? 40),
  );

  function updateCaptions(value: boolean) {
    setCaptions(value);
    window.localStorage.setItem("game-captions", String(value));
    window.dispatchEvent(new CustomEvent("game:captions", { detail: value }));
  }

  function updateCaptionSize(value: number) {
    setCaptionSize(value);
    window.localStorage.setItem("game-caption-size", String(value));
    window.dispatchEvent(
      new CustomEvent("game:caption-size", { detail: value }),
    );
  }

  function updateVolume(value: number) {
    setVolume(value);
    window.localStorage.setItem("game-volume", String(value));
    window.localStorage.setItem(
      "game-sound-choice",
      value > 0 ? "enabled" : "muted",
    );
    window.dispatchEvent(new CustomEvent("game:volume", { detail: value }));
    window.dispatchEvent(new Event("game:sound-choice"));
  }

  function updateMusicVolume(value: number) {
    setMusicVolume(value);
    window.localStorage.setItem("game-music-volume", String(value));
    window.dispatchEvent(
      new CustomEvent("game:music-volume", { detail: value }),
    );
  }

  function updateEffectsVolume(value: number) {
    setEffectsVolume(value);
    window.localStorage.setItem("game-effects-volume", String(value));
    window.dispatchEvent(
      new CustomEvent("game:effects-volume", { detail: value }),
    );
  }

  return (
    <aside
      className={cn(
        "pointer-events-none fixed right-4 top-4 z-[100] flex flex-col items-end gap-2 sm:right-6 sm:top-6",
        className,
      )}
    >
      <Button
        aria-expanded={open}
        aria-label={open ? "옵션 닫기" : "옵션 열기"}
        className="pointer-events-auto size-11 rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/20 backdrop-blur-xl hover:bg-black/55"
        onClick={() => setOpen((value) => !value)}
        size="icon-lg"
        variant="ghost"
      >
        {open ? <X /> : <Cog />}
      </Button>

      {open ? (
        <div className="pointer-events-auto w-64 rounded-[22px] border border-white/14 bg-black/68 p-3 text-white shadow-2xl shadow-black/35 backdrop-blur-2xl">
          <p className="px-2 pb-2 text-xs font-semibold tracking-[0.12em] text-white/48">
            재생 옵션
          </p>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-white/[.07]">
            <Subtitles className="size-4 text-white/62" />
            <span className="flex-1 text-sm font-medium">자막 표시</span>
            <input
              checked={captions}
              className="size-4 accent-white"
              onChange={(event) => updateCaptions(event.target.checked)}
              type="checkbox"
            />
          </label>
          <label className="block rounded-xl px-2 py-2 hover:bg-white/[.07]">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Subtitles className="size-4 text-white/62" />
              <span className="flex-1">자막 크기</span>
              <span className="text-xs tabular-nums text-white/45">
                {captionSize}%
              </span>
            </span>
            <input
              aria-label="자막 크기"
              className="mt-3 w-full accent-white"
              max="150"
              min="75"
              onChange={(event) =>
                updateCaptionSize(Number(event.target.value))
              }
              step="5"
              value={captionSize}
              type="range"
            />
          </label>
          <label className="block rounded-xl px-2 py-2 hover:bg-white/[.07]">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Volume2 className="size-4 text-white/62" />
              <span className="flex-1">전체 볼륨</span>
              <span className="text-xs tabular-nums text-white/45">
                {volume}%
              </span>
            </span>
            <input
              aria-label="전체 볼륨"
              className="mt-3 w-full accent-white"
              onChange={(event) => updateVolume(Number(event.target.value))}
              value={volume}
              type="range"
            />
          </label>
          <label className="block rounded-xl px-2 py-2 hover:bg-white/[.07]">
            <span className="flex items-center gap-3 text-sm font-medium">
              <Music className="size-4 text-white/62" />
              <span className="flex-1">배경음 볼륨</span>
              <span className="text-xs tabular-nums text-white/45">
                {musicVolume}%
              </span>
            </span>
            <input
              aria-label="배경음 볼륨"
              className="mt-3 w-full accent-white"
              onChange={(event) =>
                updateMusicVolume(Number(event.target.value))
              }
              value={musicVolume}
              type="range"
            />
          </label>
          <label className="block rounded-xl px-2 py-2 hover:bg-white/[.07]">
            <span className="flex items-center gap-3 text-sm font-medium">
              <MousePointerClick className="size-4 text-white/62" />
              <span className="flex-1">효과음 볼륨</span>
              <span className="text-xs tabular-nums text-white/45">
                {effectsVolume}%
              </span>
            </span>
            <input
              aria-label="효과음 볼륨"
              className="mt-3 w-full accent-white"
              onChange={(event) =>
                updateEffectsVolume(Number(event.target.value))
              }
              value={effectsVolume}
              type="range"
            />
          </label>
          <div className="mt-2 border-t border-white/10 pt-3">
            <p className="px-2 pb-1 text-xs font-semibold tracking-[0.12em] text-white/48">
              미디어 재생
            </p>
            <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-white/[.07]">
              <HardDrive className="size-4 text-white/62" />
              <span className="flex-1 text-sm font-medium">다운로드</span>
              <input
                checked={storageMode === "download"}
                className="size-4 accent-white"
                onChange={(event) => {
                  if (event.target.checked) requestDownload();
                }}
                type="checkbox"
              />
            </label>
            {!downloadRequired ? (
              <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-white/[.07]">
                <Wifi className="size-4 text-white/62" />
                <span className="flex-1 text-sm font-medium">스트리밍</span>
                <input
                  checked={storageMode === "stream"}
                  className="size-4 accent-white"
                  onChange={(event) => {
                    if (event.target.checked) selectStreaming();
                  }}
                  type="checkbox"
                />
              </label>
            ) : (
              <p className="px-2 py-1 text-xs leading-5 text-white/45">
                모바일에서는 다운로드 재생만 지원합니다.
              </p>
            )}
            {cachedDataAvailable ? (
              <Button
                className="mt-2 h-10 w-full"
                onClick={requestDelete}
                variant="outline"
              >
                <HardDrive data-icon="inline-start" />
                영상 및 음성 데이터 삭제
              </Button>
            ) : null}
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <Button
              className="h-10 w-full"
              onClick={() => router.push("/")}
              variant="outline"
            >
              <House data-icon="inline-start" />
              홈으로
            </Button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
