"use client";

import type { ReactNode } from "react";

import { MediaAssetProvider } from "@/features/prepare-game-media";
import { videoBaseUrl } from "@/shared/config";

import { WebAudioProvider } from "../model";
import { GameAudio } from "./GameAudio";
import { GameOptions } from "./GameOptions";
import { SoundConsent } from "./SoundConsent";
import { VideoPlaybackError } from "./VideoPlaybackError";

export function GameShell({ children }: { children: ReactNode }) {
  if (!videoBaseUrl) return <VideoPlaybackError />;

  return (
    <WebAudioProvider>
      <GameAudio />
      <MediaAssetProvider>
        <SoundConsent>
          <GameOptions />
          {children}
        </SoundConsent>
      </MediaAssetProvider>
    </WebAudioProvider>
  );
}
