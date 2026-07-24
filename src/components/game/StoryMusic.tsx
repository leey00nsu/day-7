"use client";

import { useEffect, useRef } from "react";

export type StoryMusicMode = "silent" | "gameplay" | "decision";

type StoryMusicProps = {
  mode: StoryMusicMode;
  masterVolume: number;
  musicVolume: number;
};

const GAMEPLAY_GAIN = 0.32;
const DECISION_GAIN = 0.58;
const FADE_DURATION_MS = 450;

function fadeAudio(
  audio: HTMLAudioElement,
  targetVolume: number,
  pauseWhenSilent: boolean,
) {
  const initialVolume = audio.volume;
  const startedAt = performance.now();
  let animationFrame = 0;

  function update(timestamp: number) {
    const progress = Math.min(
      Math.max((timestamp - startedAt) / FADE_DURATION_MS, 0),
      1,
    );

    audio.volume = Math.min(
      Math.max(
        initialVolume + (targetVolume - initialVolume) * progress,
        0,
      ),
      1,
    );

    if (progress < 1) {
      animationFrame = window.requestAnimationFrame(update);
    } else if (pauseWhenSilent && targetVolume === 0) {
      audio.pause();
    }
  }

  animationFrame = window.requestAnimationFrame(update);
  return () => window.cancelAnimationFrame(animationFrame);
}

export function StoryMusic({
  mode,
  masterVolume,
  musicVolume,
}: StoryMusicProps) {
  const gameplayRef = useRef<HTMLAudioElement>(null);
  const decisionRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const gameplay = gameplayRef.current;
    const decision = decisionRef.current;
    if (!gameplay || !decision) return;

    const gameplayTarget =
      mode === "gameplay"
        ? masterVolume * musicVolume * GAMEPLAY_GAIN
        : 0;
    const decisionTarget =
      mode === "decision"
        ? masterVolume * musicVolume * DECISION_GAIN
        : 0;

    function startAudio(audio: HTMLAudioElement, targetVolume: number) {
      if (targetVolume === 0) return () => undefined;

      if (audio.paused) audio.volume = 0;

      function retry() {
        void audio.play().catch(() => undefined);
      }

      void audio.play().catch(() => {
        window.addEventListener("pointerdown", retry, { once: true });
        window.addEventListener("keydown", retry, { once: true });
      });

      return () => {
        window.removeEventListener("pointerdown", retry);
        window.removeEventListener("keydown", retry);
      };
    }

    const cancelGameplayStart = startAudio(gameplay, gameplayTarget);
    const cancelDecisionStart = startAudio(decision, decisionTarget);

    const cancelGameplayFade = fadeAudio(
      gameplay,
      gameplayTarget,
      mode !== "gameplay",
    );
    const cancelDecisionFade = fadeAudio(
      decision,
      decisionTarget,
      mode !== "decision",
    );

    return () => {
      cancelGameplayFade();
      cancelDecisionFade();
      cancelGameplayStart();
      cancelDecisionStart();
    };
  }, [masterVolume, mode, musicVolume]);

  return (
    <>
      <audio
        aria-hidden="true"
        loop
        preload="auto"
        ref={gameplayRef}
        src="/audio/story-subdued-drama.mp3"
      />
      <audio
        aria-hidden="true"
        loop
        preload="auto"
        ref={decisionRef}
        src="/audio/decision-minimal-tension.mp3"
      />
    </>
  );
}
