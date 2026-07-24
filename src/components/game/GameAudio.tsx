"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const BUTTON_SOUND_GAIN = 0.9;
const HOME_MUSIC_PATHS = new Set(["/", "/endings"]);

function storedAudioVolume(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback / 100;

  return Number(window.localStorage.getItem(key) ?? fallback) / 100;
}

export function GameAudio() {
  const pathname = usePathname();
  const musicRef = useRef<HTMLAudioElement>(null);
  const buttonSoundRef = useRef<HTMLAudioElement>(null);
  const [masterVolume, setMasterVolume] = useState(() =>
    storedAudioVolume("game-volume", 80),
  );
  const [musicVolume, setMusicVolume] = useState(() =>
    storedAudioVolume("game-music-volume", 28),
  );
  const [effectsVolume, setEffectsVolume] = useState(() =>
    storedAudioVolume("game-effects-volume", 40),
  );

  useEffect(() => {
    function updateMasterVolume(event: Event) {
      setMasterVolume((event as CustomEvent<number>).detail / 100);
    }

    function updateMusicVolume(event: Event) {
      setMusicVolume((event as CustomEvent<number>).detail / 100);
    }

    function updateEffectsVolume(event: Event) {
      setEffectsVolume((event as CustomEvent<number>).detail / 100);
    }

    window.addEventListener("game:volume", updateMasterVolume);
    window.addEventListener("game:music-volume", updateMusicVolume);
    window.addEventListener("game:effects-volume", updateEffectsVolume);

    return () => {
      window.removeEventListener("game:volume", updateMasterVolume);
      window.removeEventListener("game:music-volume", updateMusicVolume);
      window.removeEventListener("game:effects-volume", updateEffectsVolume);
    };
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    music.volume = masterVolume * musicVolume;

    if (!HOME_MUSIC_PATHS.has(pathname)) {
      music.pause();
      music.currentTime = 0;
      return;
    }

    let waitingForInteraction = false;

    function startMusic() {
      const activeMusic = musicRef.current;
      if (!activeMusic || !HOME_MUSIC_PATHS.has(pathname)) return;

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
  }, [masterVolume, musicVolume, pathname]);

  useEffect(() => {
    const buttonSound = buttonSoundRef.current;
    if (!buttonSound) return;

    buttonSound.volume =
      masterVolume * effectsVolume * BUTTON_SOUND_GAIN;

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
  }, [effectsVolume, masterVolume]);

  return (
    <>
      <audio
        aria-hidden="true"
        loop
        preload="auto"
        ref={musicRef}
        src="/audio/home-minimal-piano-pulse.mp3"
      />
      <audio
        aria-hidden="true"
        preload="auto"
        ref={buttonSoundRef}
        src="/audio/ui-select-click.mp3"
      />
    </>
  );
}
