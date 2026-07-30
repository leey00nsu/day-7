"use client";

import { useEffect, useRef } from "react";

import { useMediaAssetUrl } from "@/features/prepare-game-media";
import {
  useHowlerSound,
  useWebAudioSettings,
} from "@/widgets/game-shell";

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
  const { getSound: getGameplaySound } = useHowlerSound({
    channel: "music",
    gain: GAMEPLAY_GAIN,
    loop: true,
    muted: hardMuted,
    src: gameplaySrc,
  });
  const { getSound: getDecisionSound } = useHowlerSound({
    channel: "music",
    gain: DECISION_GAIN,
    loop: true,
    muted: hardMuted,
    src: decisionSrc,
  });

  useEffect(() => {
    const gameplay = getGameplaySound();
    const decision = getDecisionSound();
    if (!gameplay || !decision) return;

    if (
      mode === "decision" &&
      previousModeRef.current !== "decision"
    ) {
      decision.stop();
    }

    if (hardMuted) {
      gameplay.pause();
      decision.pause();
      previousModeRef.current = mode;
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

    if (activeAudio) {
      const targetVolume =
        musicVolume *
        (mode === "decision" ? DECISION_GAIN : GAMEPLAY_GAIN);
      const currentVolume = activeAudio.playing()
        ? activeAudio.volume()
        : 0;

      activeAudio.mute(false);
      activeAudio.volume(currentVolume);
      if (!activeAudio.playing()) activeAudio.play();
      activeAudio.fade(currentVolume, targetVolume, FADE_DURATION_MS);
    }

    const soundsToFade =
      mode === "silent"
        ? [gameplay, decision]
        : inactiveAudio
          ? [inactiveAudio]
          : [];

    for (const sound of soundsToFade) {
      if (sound.playing()) {
        const currentVolume = sound.volume();
        sound.fade(currentVolume, 0, FADE_DURATION_MS);
        sound.once("fade", () => sound.pause());
      } else {
        sound.volume(0);
      }
    }

    previousModeRef.current = mode;

    return () => {
      gameplay.off("fade");
      decision.off("fade");
    };
  }, [
    getDecisionSound,
    getGameplaySound,
    hardMuted,
    mode,
    musicVolume,
  ]);

  return null;
}
