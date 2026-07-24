"use client";

import { useEffect, useRef } from "react";

type NarrationAudioProps = {
  src?: string;
  volume: number;
  paused?: boolean;
  onEnded?: () => void;
};

export function NarrationAudio({
  src,
  volume,
  paused = false,
  onEnded,
}: NarrationAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = Math.min(Math.max(volume, 0), 1);
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (paused) {
      audio.pause();
      return;
    }

    function retry() {
      const retryAudio = audioRef.current;
      if (retryAudio) {
        void retryAudio.play().catch(() => undefined);
      }
    }

    void audio.play().catch(() => {
      window.addEventListener("pointerdown", retry, { once: true });
      window.addEventListener("keydown", retry, { once: true });
    });

    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
    };
  }, [paused, src]);

  return (
    <audio
      aria-hidden="true"
      onEnded={onEnded}
      preload="auto"
      ref={audioRef}
      src={src}
    />
  );
}
