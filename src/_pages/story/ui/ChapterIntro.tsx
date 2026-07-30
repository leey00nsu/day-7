"use client";

import { useEffect } from "react";

import { cn } from "@/shared/lib/cn";

import { useMediaAssetUrl } from "@/features/prepare-game-media";
import { useHowlerSound } from "@/features/manage-game-audio";

type ChapterIntroProps = {
  title: string;
  description?: string;
  onComplete?: () => void;
  muted?: boolean;
  className?: string;
};

const INTRO_DURATION_MS = 2600;
const CHAPTER_SOUND_GAIN = 1.05;

export function ChapterIntro({
  title,
  description,
  onComplete,
  muted = false,
  className,
}: ChapterIntroProps) {
  const chapterSoundSrc = useMediaAssetUrl(
    "/audio/chapter-clock-ticking.mp3",
  );
  const { play: playChapterSound, stop: stopChapterSound } =
    useHowlerSound({
      channel: "effects",
      gain: CHAPTER_SOUND_GAIN,
      muted,
      src: chapterSoundSrc,
    });

  useEffect(() => {
    playChapterSound({ restart: true });
    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(completeTimer);
      stopChapterSound();
    };
  }, [onComplete, playChapterSound, stopChapterSound]);

  return (
    <section
      aria-label={`${title} 장 시작`}
      className={cn(
        "absolute inset-0 z-[70] grid cursor-default place-items-center bg-black px-6 text-center text-white",
        className,
      )}
    >
      <div className="grid min-h-44 min-w-48 animate-[chapter-title-fade_2.2s_ease-out_both] grid-rows-[1fr_2rem] content-center">
        <p className="self-end text-[clamp(2.25rem,7vw,5.5rem)] font-bold tracking-[0.1em]">
          {title}
        </p>
        <p
          className={cn(
            "mt-5 self-start text-sm font-medium tracking-[0.18em] text-white/48 sm:text-base",
            !description && "invisible",
          )}
        >
          {description || "\u00a0"}
        </p>
      </div>
    </section>
  );
}
