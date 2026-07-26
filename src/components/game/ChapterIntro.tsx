"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { useMediaAssetUrl } from "./MediaAssetProvider";
import { useWebAudioMedia } from "./WebAudioProvider";

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
  const audioRef = useRef<HTMLAudioElement>(null);
  const chapterSoundSrc = useMediaAssetUrl(
    "/audio/chapter-clock-ticking.mp3",
  );
  useWebAudioMedia(audioRef, {
    channel: "effects",
    gain: CHAPTER_SOUND_GAIN,
    muted,
  });

  useEffect(() => {
    const completeTimer = window.setTimeout(() => {
      onComplete?.();
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

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
      <audio
        aria-hidden="true"
        autoPlay
        crossOrigin="anonymous"
        muted={muted}
        preload="auto"
        ref={audioRef}
        src={chapterSoundSrc}
      />
    </section>
  );
}
