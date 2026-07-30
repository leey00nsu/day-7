"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

import { useMediaAssetUrl } from "@/features/prepare-game-media";
import {
  useWebAudioMedia,
  type WebAudioChannel,
  VideoPlaybackError,
} from "@/widgets/game-shell";

type GameVideoProps = Omit<ComponentPropsWithoutRef<"video">, "src"> & {
  audioChannel?: WebAudioChannel;
  audioGain?: number;
  filename: string;
};

export const GameVideo = forwardRef<HTMLVideoElement, GameVideoProps>(
  function GameVideo(
    {
      audioChannel = "voice",
      audioGain = 1,
      filename,
      muted = false,
      onError,
      ...props
    },
    ref,
  ) {
    const src = useMediaAssetUrl(filename);
    const [hasError, setHasError] = useState(!src);
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(
      ref,
      () => videoRef.current as HTMLVideoElement,
      [],
    );
    useWebAudioMedia(videoRef, {
      channel: audioChannel,
      gain: audioGain,
      muted,
    });

    useEffect(() => {
      setHasError(!src);
    }, [src]);

    return (
      <>
        <video
          {...props}
          crossOrigin="anonymous"
          muted={muted}
          ref={videoRef}
          src={src}
          onError={(event) => {
            setHasError(true);
            onError?.(event);
          }}
        />
        {hasError ? <VideoPlaybackError /> : null}
      </>
    );
  },
);
