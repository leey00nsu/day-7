"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useMediaAssetUrl } from "./MediaAssetProvider";
import {
  useWebAudioMedia,
  useWebAudioSettings,
} from "./WebAudioProvider";

const BUTTON_SOUND_GAIN = 0.9;
const HOME_MUSIC_PATHS = new Set(["/", "/endings", "/report"]);

export function GameAudio() {
  const pathname = usePathname();
  const homeMusicSrc = useMediaAssetUrl(
    "/audio/home-minimal-piano-pulse.mp3",
  );
  const buttonSoundSrc = useMediaAssetUrl(
    "/audio/ui-select-click.mp3",
  );
  const musicRef = useRef<HTMLAudioElement>(null);
  const buttonSoundRef = useRef<HTMLAudioElement>(null);
  const { masterVolume, soundEnabled } = useWebAudioSettings();

  useWebAudioMedia(musicRef, {
    channel: "music",
    muted: !soundEnabled || masterVolume <= 0,
  });
  useWebAudioMedia(buttonSoundRef, {
    channel: "effects",
    gain: BUTTON_SOUND_GAIN,
    muted: !soundEnabled || masterVolume <= 0,
  });

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    if (
      !soundEnabled ||
      masterVolume <= 0 ||
      !HOME_MUSIC_PATHS.has(pathname)
    ) {
      music.pause();
      music.currentTime = 0;
      return;
    }

    let waitingForInteraction = false;

    function startMusic() {
      const activeMusic = musicRef.current;
      if (
        !activeMusic ||
        !soundEnabled ||
        masterVolume <= 0 ||
        !HOME_MUSIC_PATHS.has(pathname)
      ) {
        return;
      }

      void activeMusic.play().then(
        () => {
          waitingForInteraction = false;
          window.removeEventListener("pointerdown", startMusic);
          window.removeEventListener("keydown", startMusic);
        },
        () => {
          if (waitingForInteraction) return;
          waitingForInteraction = true;
          window.addEventListener("pointerdown", startMusic, { once: true });
          window.addEventListener("keydown", startMusic, { once: true });
        },
      );
    }

    startMusic();

    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
  }, [masterVolume, pathname, soundEnabled]);

  useEffect(() => {
    if (!soundEnabled || masterVolume <= 0) return;

    function playButtonSound(event: PointerEvent) {
      const target = event.target as HTMLElement;
      const control = target.closest<HTMLElement>(
        "button:not(:disabled), a[href], [role='button']",
      );

      if (!control || control.dataset.sound === "none") return;

      const activeButtonSound = buttonSoundRef.current;
      if (!activeButtonSound) return;

      activeButtonSound.currentTime = 0;
      void activeButtonSound.play().catch(() => undefined);
    }

    document.addEventListener("pointerdown", playButtonSound);
    return () => document.removeEventListener("pointerdown", playButtonSound);
  }, [masterVolume, soundEnabled]);

  return (
    <>
      <audio
        aria-hidden="true"
        crossOrigin="anonymous"
        loop
        muted={!soundEnabled || masterVolume <= 0}
        preload="auto"
        ref={musicRef}
        src={homeMusicSrc}
      />
      <audio
        aria-hidden="true"
        crossOrigin="anonymous"
        muted={!soundEnabled || masterVolume <= 0}
        preload="auto"
        ref={buttonSoundRef}
        src={buttonSoundSrc}
      />
    </>
  );
}
