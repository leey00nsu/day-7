"use client";

import { type ReactNode, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

const SOUND_CHOICE_STORAGE_KEY = "game-sound-choice";
const SOUND_CHOICE_EVENT = "game:sound-choice";

function getSoundChoiceSnapshot() {
  return typeof window === "undefined"
    ? ""
    : (window.localStorage.getItem(SOUND_CHOICE_STORAGE_KEY) ?? "");
}

function subscribeToSoundChoice(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === SOUND_CHOICE_STORAGE_KEY) onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SOUND_CHOICE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SOUND_CHOICE_EVENT, onStoreChange);
  };
}

function saveSoundChoice(choice: "enabled" | "muted") {
  window.localStorage.setItem(SOUND_CHOICE_STORAGE_KEY, choice);

  if (choice === "muted") {
    window.localStorage.setItem("game-volume", "0");
    window.dispatchEvent(
      new CustomEvent("game:volume", { detail: 0 }),
    );
  } else {
    const storedVolume = Number(
      window.localStorage.getItem("game-volume") ?? 80,
    );
    const nextVolume = storedVolume > 0 ? storedVolume : 80;

    window.localStorage.setItem("game-volume", String(nextVolume));
    window.dispatchEvent(
      new CustomEvent("game:volume", { detail: nextVolume }),
    );
  }

  window.dispatchEvent(new Event(SOUND_CHOICE_EVENT));
}

type SoundConsentPromptProps = {
  onEnable?: () => void;
  onDisable?: () => void;
};

export function SoundConsentPrompt({
  onEnable = () => saveSoundChoice("enabled"),
  onDisable = () => saveSoundChoice("muted"),
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
    subscribeToSoundChoice,
    getSoundChoiceSnapshot,
    () => "",
  );

  return soundChoice ? children : <SoundConsentPrompt />;
}
