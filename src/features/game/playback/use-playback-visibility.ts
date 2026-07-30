"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PlaybackVisibilityOptions = {
  isPlaying: boolean;
  pausePlayback: () => void;
};

export function usePlaybackVisibility({
  isPlaying,
  pausePlayback,
}: PlaybackVisibilityOptions) {
  const pausePlaybackRef = useRef(pausePlayback);
  const wasPlayingBeforeHiddenRef = useRef(false);
  const [pageHidden, setPageHidden] = useState(false);
  const [resumeRequired, setResumeRequired] = useState(false);

  useEffect(() => {
    pausePlaybackRef.current = pausePlayback;
  }, [pausePlayback]);

  const requireResume = useCallback(() => {
    wasPlayingBeforeHiddenRef.current = true;
    setResumeRequired(true);
  }, []);

  const finishResume = useCallback(() => {
    wasPlayingBeforeHiddenRef.current = false;
    setResumeRequired(false);
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        setPageHidden(true);
        wasPlayingBeforeHiddenRef.current = isPlaying;

        if (isPlaying) pausePlaybackRef.current();
        return;
      }

      setPageHidden(false);
      if (wasPlayingBeforeHiddenRef.current) {
        setResumeRequired(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
  }, [isPlaying]);

  return {
    finishResume,
    pageHidden,
    requireResume,
    resumeRequired,
  };
}
