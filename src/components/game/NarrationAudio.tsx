"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { useMediaAssetUrl } from "./MediaAssetProvider";

type NarrationAudioProps = {
  src?: string;
  volume: number;
  onEnded?: () => void;
  onError?: () => void;
  onReady?: () => void;
  onStalled?: () => void;
  onWaiting?: () => void;
};

export type NarrationAudioHandle = {
  pause: () => void;
  play: () => Promise<void>;
  reset: () => void;
  readyState: () => number;
};

export const NarrationAudio = forwardRef<
  NarrationAudioHandle,
  NarrationAudioProps
>(function NarrationAudio(
  {
    src,
    volume,
    onEnded,
    onError,
    onReady,
    onStalled,
    onWaiting,
  },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onReadyRef = useRef(onReady);
  const resolvedSrc = useMediaAssetUrl(src);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useImperativeHandle(
    ref,
    () => ({
      pause() {
        audioRef.current?.pause();
      },
      async play() {
        const audio = audioRef.current;
        if (!audio || !resolvedSrc) return;

        await audio.play();
      },
      reset() {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
      },
      readyState() {
        return audioRef.current?.readyState ?? HTMLMediaElement.HAVE_NOTHING;
      },
    }),
    [resolvedSrc],
  );

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
    audio.load();

    if (
      resolvedSrc &&
      audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
    ) {
      onReadyRef.current?.();
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [resolvedSrc]);

  return (
    <audio
      aria-hidden="true"
      onEnded={onEnded}
      onError={onError}
      onCanPlay={onReady}
      onCanPlayThrough={onReady}
      onStalled={onStalled}
      onWaiting={onWaiting}
      preload="auto"
      ref={audioRef}
      src={resolvedSrc}
    />
  );
});
