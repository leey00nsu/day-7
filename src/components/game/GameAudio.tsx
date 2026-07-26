"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useMediaAssetUrl } from "./MediaAssetProvider";
import { useWebAudioSettings } from "./WebAudioProvider";
import { useHowlerSound } from "./useHowlerSound";

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
  const { masterVolume, soundEnabled } = useWebAudioSettings();
  const { play: playHomeMusic, stop: stopHomeMusic } = useHowlerSound({
    channel: "music",
    loop: true,
    muted: !soundEnabled || masterVolume <= 0,
    src: homeMusicSrc,
  });
  const { play: playButtonSound } = useHowlerSound({
    channel: "effects",
    gain: BUTTON_SOUND_GAIN,
    muted: !soundEnabled || masterVolume <= 0,
    src: buttonSoundSrc,
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

      if (!control || control.dataset.sound === "none") return;

      playButtonSound({ restart: true });
    }

    document.addEventListener("pointerdown", handleButtonPress);
    return () =>
      document.removeEventListener("pointerdown", handleButtonPress);
  }, [masterVolume, playButtonSound, soundEnabled]);

  return null;
}
