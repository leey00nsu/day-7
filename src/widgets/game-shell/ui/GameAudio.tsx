"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import {
  useHowlerSound,
  useWebAudioSettings,
} from "@/features/manage-game-audio";
import { AUDIO_ACTIVATED_EVENT } from "./SoundConsent";

const BUTTON_SOUND_GAIN = 0.9;
const BUTTON_SOUND_SRC = "/audio/ui-select-click.mp3";
const HOME_MUSIC_SRC = "/audio/home-minimal-piano-pulse.mp3";
const HOME_MUSIC_PATHS = new Set(["/", "/endings", "/report"]);

export function GameAudio() {
  const pathname = usePathname();
  const { masterVolume, soundEnabled } = useWebAudioSettings();
  const { play: playHomeMusic, stop: stopHomeMusic } = useHowlerSound({
    channel: "music",
    loop: true,
    muted: !soundEnabled || masterVolume <= 0,
    src: HOME_MUSIC_SRC,
  });
  const { play: playButtonSound } = useHowlerSound({
    channel: "effects",
    gain: BUTTON_SOUND_GAIN,
    muted: !soundEnabled || masterVolume <= 0,
    src: BUTTON_SOUND_SRC,
  });

  useEffect(() => {
    if (
      !soundEnabled ||
      masterVolume <= 0 ||
      !HOME_MUSIC_PATHS.has(pathname)
    ) {
      stopHomeMusic();
      return;
    }

    playHomeMusic();
  }, [
    masterVolume,
    pathname,
    playHomeMusic,
    soundEnabled,
    stopHomeMusic,
  ]);

  useEffect(() => {
    if (!soundEnabled || masterVolume <= 0) return;

    function handleButtonPress(event: PointerEvent) {
      const target = event.target as HTMLElement;
      const control = target.closest<HTMLElement>(
        "button:not(:disabled), a[href], [role='button']",
      );

      if (!control) return;

      if (HOME_MUSIC_PATHS.has(pathname)) {
        playHomeMusic({ force: true });
      }
      if (control.dataset.sound === "none") return;

      playButtonSound({ restart: true });
    }

    document.addEventListener("pointerdown", handleButtonPress);
    return () =>
      document.removeEventListener("pointerdown", handleButtonPress);
  }, [
    masterVolume,
    pathname,
    playButtonSound,
    playHomeMusic,
    soundEnabled,
  ]);

  useEffect(() => {
    function startHomeMusicFromUserGesture() {
      if (!HOME_MUSIC_PATHS.has(pathname)) return;
      playHomeMusic({ force: true, restart: true });
    }

    window.addEventListener(
      AUDIO_ACTIVATED_EVENT,
      startHomeMusicFromUserGesture,
    );
    return () =>
      window.removeEventListener(
        AUDIO_ACTIVATED_EVENT,
        startHomeMusicFromUserGesture,
      );
  }, [pathname, playHomeMusic]);

  return null;
}
