"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { useMediaAssetUrl } from "./MediaAssetProvider";
import { useWebAudioMedia } from "./WebAudioProvider";

type NarrationAudioProps = {
  gain?: number;
  muted?: boolean;
  src?: string;
  onEnded?: () => void;
  onError?: () => void;
  onPause?: () => void;
  onPlaying?: () => void;
  onReady?: () => void;
  onStalled?: () => void;
  onWaiting?: () => void;
};

export type NarrationAudioHandle = {
  pause: () => void;
  play: () => Promise<void>;
  reload: () => void;
  reset: () => void;
  readyState: () => number;
};

export const NarrationAudio = forwardRef<
  NarrationAudioHandle,
  NarrationAudioProps
>(function NarrationAudio(
  {
    src,
    gain = 1,
    muted = false,
    onEnded,
    onError,
    onPause,
    onPlaying,
    onReady,
    onStalled,
    onWaiting,
  },
  ref,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onReadyRef = useRef(onReady);
  const resolvedSrc = useMediaAssetUrl(src);
  useWebAudioMedia(audioRef, {
    channel: "voice",
    gain,
    muted,
  });

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
      reload() {
        const audio = audioRef.current;
        if (!audio) return;

        audio.pause();
        audio.currentTime = 0;
        audio.load();
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
      crossOrigin="anonymous"
      onEnded={onEnded}
      onError={onError}
      onPause={onPause}
      onPlaying={onPlaying}
      onCanPlay={onReady}
      onCanPlayThrough={onReady}
      onStalled={onStalled}
      onWaiting={onWaiting}
      muted={muted}
      preload="auto"
      ref={audioRef}
      src={resolvedSrc}
    />
  );
});
