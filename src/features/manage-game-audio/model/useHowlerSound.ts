"use client";

import { Howl } from "howler";
import { useCallback, useEffect, useRef } from "react";

import { useWebAudioSettings } from "./WebAudioProvider";

export type HowlerSoundChannel = "music" | "effects";

type UseHowlerSoundOptions = {
  channel: HowlerSoundChannel;
  gain?: number;
  loop?: boolean;
  muted?: boolean;
  src?: string;
};

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

export function useHowlerSound({
  channel,
  gain = 1,
  loop = false,
  muted = false,
  src,
}: UseHowlerSoundOptions) {
  const soundRef = useRef<Howl | null>(null);
  const { effectsVolume, masterVolume, musicVolume, soundEnabled } =
    useWebAudioSettings();
  const channelVolume =
    channel === "music" ? musicVolume : effectsVolume;
  const outputVolume = clamp(channelVolume * gain);
  const hardMuted = muted || !soundEnabled || masterVolume <= 0;

  useEffect(() => {
    if (!src) {
      soundRef.current = null;
      return;
    }

    const sound = new Howl({
      format: ["mp3"],
      html5: false,
      loop,
      mute: true,
      preload: true,
      src: [src],
      volume: 0,
    });
    soundRef.current = sound;

    return () => {
      if (soundRef.current === sound) soundRef.current = null;
      sound.unload();
    };
  }, [loop, src]);

  useEffect(() => {
    const sound = soundRef.current;
    if (!sound) return;

    sound.volume(outputVolume);
    sound.mute(hardMuted);
  }, [hardMuted, outputVolume, src]);

  const play = useCallback(
    ({
      force = false,
      restart = false,
    }: { force?: boolean; restart?: boolean } = {}) => {
      if (!src) return;

      const sound = soundRef.current;
      if (!sound || (!force && hardMuted)) return;

      if (force) {
        sound.volume(outputVolume);
        sound.mute(false);
      }

      if (restart) sound.stop();
      if (!restart && sound.playing()) return;

      sound.once("playerror", (failedId) => {
        sound.once("unlock", () => {
          if (force || !hardMuted) sound.play(failedId);
        });
      });
      const soundId = sound.play();

      return soundId;
    },
    [hardMuted, outputVolume, src],
  );

  const pause = useCallback(() => {
    soundRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    soundRef.current?.stop();
  }, []);

  const getSound = useCallback(
    () => (src ? soundRef.current : null),
    [src],
  );

  return {
    getSound,
    pause,
    play,
    stop,
  };
}
