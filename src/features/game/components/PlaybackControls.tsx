"use client";

import { ChevronsRight, Pause, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PlaybackMode } from "@/features/game/domain/game-state";

type PlaybackControlsProps = {
  isPlaying: boolean;
  mode: PlaybackMode;
  onSkip: () => void;
  onToggle: () => void;
};

export function PlaybackControls({
  isPlaying,
  mode,
  onSkip,
  onToggle,
}: PlaybackControlsProps) {
  const hasVideo =
    mode === "main" || mode === "branch" || mode === "ending";
  const canToggle = hasVideo || mode === "endingNarration";

  if (!canToggle) return null;

  return (
    <>
      {hasVideo ? (
        <Button
          aria-label="현재 영상 건너뛰기"
          className="fixed right-[7.5rem] top-4 z-[90] size-11 rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/20 backdrop-blur-xl hover:bg-black/55 sm:right-[8rem] sm:top-6"
          onClick={onSkip}
          size="icon-lg"
          title="영상 넘기기"
          variant="ghost"
        >
          <ChevronsRight />
        </Button>
      ) : null}
      <Button
        aria-label={isPlaying ? "일시정지" : "재생"}
        className="fixed right-[4.25rem] top-4 z-[90] size-11 rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/20 backdrop-blur-xl hover:bg-black/55 sm:right-[4.75rem] sm:top-6"
        onClick={onToggle}
        size="icon-lg"
        variant="ghost"
      >
        {isPlaying ? <Pause /> : <Play />}
      </Button>
    </>
  );
}
