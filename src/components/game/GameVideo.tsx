"use client";

import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";

import { getVideoUrl } from "@/lib/video";

import { VideoPlaybackError } from "./VideoPlaybackError";

type GameVideoProps = Omit<ComponentPropsWithoutRef<"video">, "src"> & {
  filename: string;
};

export const GameVideo = forwardRef<HTMLVideoElement, GameVideoProps>(
  function GameVideo({ filename, onError, ...props }, ref) {
    const src = getVideoUrl(filename);
    const [hasError, setHasError] = useState(!src);

    return (
      <>
        <video
          {...props}
          ref={ref}
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
