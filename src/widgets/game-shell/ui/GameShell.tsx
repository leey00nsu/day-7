"use client";

import { type ReactNode, useMemo } from "react";

import { GameAudioProvider } from "@/features/manage-game-audio";
import { useGamePreferences } from "@/features/manage-game-preferences";
import {
  MediaAssetProvider,
  VideoPlaybackError,
} from "@/features/prepare-game-media";
import { videoBaseUrl } from "@/shared/config";

import { GameAudio } from "./GameAudio";
import { GameOptions } from "./GameOptions";
import { SoundConsent } from "./SoundConsent";

export function GameShell({ children }: { children: ReactNode }) {
  const effectsVolume = useGamePreferences(
    (state) => state.effectsVolume,
  );
  const masterVolume = useGamePreferences(
    (state) => state.masterVolume,
  );
  const musicVolume = useGamePreferences(
    (state) => state.musicVolume,
  );
  const soundChoice = useGamePreferences((state) => state.soundChoice);
  const audioSettings = useMemo(
    () => ({
      effectsVolume: effectsVolume / 100,
      masterVolume: masterVolume / 100,
      musicVolume: musicVolume / 100,
      soundEnabled: soundChoice === "enabled",
    }),
    [effectsVolume, masterVolume, musicVolume, soundChoice],
  );

  if (!videoBaseUrl) return <VideoPlaybackError />;

  return (
    <GameAudioProvider settings={audioSettings}>
      <GameAudio />
      <MediaAssetProvider>
        <SoundConsent>
          <GameOptions />
          {children}
        </SoundConsent>
      </MediaAssetProvider>
    </GameAudioProvider>
  );
}
