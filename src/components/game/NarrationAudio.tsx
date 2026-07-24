"use client";

import { useEffect, useRef } from "react";

type NarrationAudioProps = {
  src?: string;
  volume: number;
};

export function NarrationAudio({ src, volume }: NarrationAudioProps) {
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

    if (!src) return;

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
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src]);

  return (
    <audio
      aria-hidden="true"
      preload="auto"
      ref={audioRef}
      src={src}
    />
  );
}
