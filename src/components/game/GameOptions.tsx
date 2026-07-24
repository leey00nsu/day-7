"use client";

import { Cog, House, Subtitles, Volume2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GameOptionsProps = {
  className?: string;
};

export function GameOptions({ className }: GameOptionsProps) {
  const [open, setOpen] = useState(false);
  const [captions, setCaptions] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.localStorage.getItem("game-captions") !== "false",
  );
  const [volume, setVolume] = useState(() =>
    typeof window === "undefined"
      ? 80
      : Number(window.localStorage.getItem("game-volume") ?? 80),
  );

  function updateCaptions(value: boolean) {
    setCaptions(value);
    window.localStorage.setItem("game-captions", String(value));
    window.dispatchEvent(new CustomEvent("game:captions", { detail: value }));
  }

  function updateVolume(value: number) {
    setVolume(value);
    window.localStorage.setItem("game-volume", String(value));
    window.dispatchEvent(new CustomEvent("game:volume", { detail: value }));
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
              <Volume2 className="size-4 text-white/62" />
              음성 볼륨
            </span>
            <input
              aria-label="음성 볼륨"
              className="mt-3 w-full accent-white"
              onChange={(event) => updateVolume(Number(event.target.value))}
              value={volume}
              type="range"
            />
          </label>
          <div className="mt-2 border-t border-white/10 pt-3">
            <Button
              className="h-10 w-full"
              onClick={() => window.location.assign("/")}
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
