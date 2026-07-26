"use client";

import { useEffect, useRef } from "react";

import { useMediaAssetUrl } from "./MediaAssetProvider";
import {
  useWebAudioMedia,
  useWebAudioSettings,
} from "./WebAudioProvider";

export type StoryMusicMode = "silent" | "gameplay" | "decision";

type StoryMusicProps = {
  mode: StoryMusicMode;
  suspended?: boolean;
};

const GAMEPLAY_GAIN = 0.32;
const DECISION_GAIN = 0.58;
const FADE_DURATION_MS = 450;

export function StoryMusic({
  mode,
  suspended = false,
}: StoryMusicProps) {
  const gameplayRef = useRef<HTMLAudioElement>(null);
  const decisionRef = useRef<HTMLAudioElement>(null);
  const previousModeRef = useRef<StoryMusicMode>(mode);
  const { masterVolume, musicVolume, soundEnabled } =
    useWebAudioSettings();
  const gameplaySrc = useMediaAssetUrl(
    "/audio/story-subdued-drama.mp3",
  );
  const decisionSrc = useMediaAssetUrl(
    "/audio/decision-minimal-tension.mp3",
  );
  const hardMuted =
    suspended ||
    !soundEnabled ||
    masterVolume <= 0 ||
    musicVolume <= 0;
  const gameplayGain =
    !hardMuted && mode === "gameplay" ? GAMEPLAY_GAIN : 0;
  const decisionGain =
    !hardMuted && mode === "decision" ? DECISION_GAIN : 0;

  useWebAudioMedia(gameplayRef, {
    channel: "music",
    gain: gameplayGain,
    muted: hardMuted,
    rampMs: FADE_DURATION_MS,
  });
  useWebAudioMedia(decisionRef, {
    channel: "music",
    gain: decisionGain,
    muted: hardMuted,
    rampMs: FADE_DURATION_MS,
  });

  useEffect(() => {
    const gameplay = gameplayRef.current;
    const decision = decisionRef.current;
    if (!gameplay || !decision) return;

    if (
      mode === "decision" &&
      previousModeRef.current !== "decision"
    ) {
      decision.pause();
      decision.currentTime = 0;
    }
    previousModeRef.current = mode;

    if (hardMuted) {
      gameplay.pause();
      decision.pause();
      return;
    }

    const activeAudio =
      mode === "gameplay"
        ? gameplay
        : mode === "decision"
          ? decision
          : null;
    const inactiveAudio =
      mode === "gameplay"
        ? decision
        : mode === "decision"
          ? gameplay
          : null;

    function retry() {
      if (activeAudio) void activeAudio.play().catch(() => undefined);
    }

    if (activeAudio) {
      void activeAudio.play().catch(() => {
        window.addEventListener("click", retry, { once: true });
        window.addEventListener("keydown", retry, { once: true });
        window.addEventListener("touchend", retry, { once: true });
      });
    }

    const pauseTimer = window.setTimeout(() => {
      inactiveAudio?.pause();
    }, FADE_DURATION_MS);

    return () => {
      window.clearTimeout(pauseTimer);
      window.removeEventListener("click", retry);
      window.removeEventListener("keydown", retry);
      window.removeEventListener("touchend", retry);
    };
  }, [hardMuted, mode]);

  return (
    <>
      <audio
        aria-hidden="true"
        crossOrigin="anonymous"
        loop
        muted={hardMuted}
        preload={mode === "gameplay" ? "auto" : "metadata"}
        ref={gameplayRef}
        src={gameplaySrc}
      />
      <audio
        aria-hidden="true"
        crossOrigin="anonymous"
        loop
        muted={hardMuted}
        preload={mode === "decision" ? "auto" : "metadata"}
        ref={decisionRef}
        src={decisionSrc}
      />
    </>
  );
}
