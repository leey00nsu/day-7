"use client";

import { type ReactNode, useSyncExternalStore } from "react";

import { Button } from "@/shared/ui/button";
import {
  getSoundChoiceSnapshot,
  saveSoundChoice,
  subscribeToGamePreferences,
  type SoundChoice,
} from "@/features/manage-game-preferences";

export const AUDIO_ACTIVATED_EVENT = "game:audio-activated";

function chooseSound(choice: Exclude<SoundChoice, "unset">) {
  saveSoundChoice(choice);
  if (choice === "enabled") {
    window.dispatchEvent(new Event(AUDIO_ACTIVATED_EVENT));
  }
}

type SoundConsentPromptProps = {
  onEnable?: () => void;
  onDisable?: () => void;
};

export function SoundConsentPrompt({
  onEnable = () => chooseSound("enabled"),
  onDisable = () => chooseSound("muted"),
}: SoundConsentPromptProps) {
  return (
    <section
      aria-labelledby="sound-consent-title"
      aria-modal="true"
      className="fixed inset-0 z-[200] grid place-items-center bg-black px-5 text-center text-white"
      role="dialog"
    >
      <div>
        <h1
          className="text-2xl font-bold tracking-tight sm:text-3xl"
          id="sound-consent-title"
        >
          사운드를 사용할까요?
        </h1>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            className="min-w-32"
            data-sound="none"
            onClick={onEnable}
            size="lg"
            variant="outline"
          >
            사용한다
          </Button>
          <Button
            className="min-w-32"
            data-sound="none"
            onClick={onDisable}
            size="lg"
            variant="outline"
          >
            사용하지 않는다
          </Button>
        </div>
      </div>
    </section>
  );
}

export function SoundConsent({ children }: { children: ReactNode }) {
  const soundChoice = useSyncExternalStore(
    subscribeToGamePreferences,
    getSoundChoiceSnapshot,
    () => "loading",
  );

  if (soundChoice === "loading") {
    return (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[200] bg-black"
      />
    );
  }

  return soundChoice === "unset" ? <SoundConsentPrompt /> : children;
}
