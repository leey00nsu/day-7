export type SoundChoice = "unset" | "enabled" | "muted";

export type GamePreferences = {
  captionSize: number;
  captionsEnabled: boolean;
  effectsVolume: number;
  masterVolume: number;
  musicVolume: number;
  soundChoice: SoundChoice;
};

const PREFERENCES_CHANGED_EVENT = "game:preferences-changed";

const storageKeys = {
  captionSize: "game-caption-size",
  captionsEnabled: "game-captions",
  effectsVolume: "game-effects-volume",
  masterVolume: "game-volume",
  musicVolume: "game-music-volume",
  soundChoice: "game-sound-choice",
} as const;

export const defaultGamePreferences: GamePreferences = {
  captionSize: 100,
  captionsEnabled: true,
  effectsVolume: 40,
  masterVolume: 80,
  musicVolume: 28,
  soundChoice: "unset",
};

let cachedSnapshot: GamePreferences | undefined;

function clampNumber(
  value: string | null,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  if (value === null) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, minimum), maximum);
}

export function readGamePreferences(
  storage: Pick<Storage, "getItem">,
  compactCaptions = false,
): GamePreferences {
  const soundChoice = storage.getItem(storageKeys.soundChoice);

  return {
    captionSize: clampNumber(
      storage.getItem(storageKeys.captionSize),
      compactCaptions ? 75 : 100,
      75,
      150,
    ),
    captionsEnabled:
      storage.getItem(storageKeys.captionsEnabled) !== "false",
    effectsVolume: clampNumber(
      storage.getItem(storageKeys.effectsVolume),
      defaultGamePreferences.effectsVolume,
      0,
      100,
    ),
    masterVolume: clampNumber(
      storage.getItem(storageKeys.masterVolume),
      defaultGamePreferences.masterVolume,
      0,
      100,
    ),
    musicVolume: clampNumber(
      storage.getItem(storageKeys.musicVolume),
      defaultGamePreferences.musicVolume,
      0,
      100,
    ),
    soundChoice:
      soundChoice === "enabled" || soundChoice === "muted"
        ? soundChoice
        : "unset",
  };
}

function readBrowserPreferences() {
  const compactCaptions = window.matchMedia(
    "(max-width: 767px), (pointer: coarse) and (max-width: 1024px)",
  ).matches;

  return readGamePreferences(window.localStorage, compactCaptions);
}

export function getGamePreferencesSnapshot() {
  if (typeof window === "undefined") return defaultGamePreferences;

  cachedSnapshot ??= readBrowserPreferences();
  return cachedSnapshot;
}

export function getSoundChoiceSnapshot() {
  return getGamePreferencesSnapshot().soundChoice;
}

export function subscribeToGamePreferences(
  onStoreChange: () => void,
) {
  function emitChange() {
    cachedSnapshot = readBrowserPreferences();
    onStoreChange();
  }

  function handleStorage(event: StorageEvent) {
    if (
      event.key === null ||
      Object.values(storageKeys).includes(
        event.key as (typeof storageKeys)[keyof typeof storageKeys],
      )
    ) {
      emitChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PREFERENCES_CHANGED_EVENT, emitChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PREFERENCES_CHANGED_EVENT, emitChange);
  };
}

export function updateGamePreferences(
  patch: Partial<GamePreferences>,
) {
  if (typeof window === "undefined") return;

  const current = getGamePreferencesSnapshot();
  const next: GamePreferences = {
    ...current,
    ...patch,
  };

  window.localStorage.setItem(
    storageKeys.captionSize,
    String(next.captionSize),
  );
  window.localStorage.setItem(
    storageKeys.captionsEnabled,
    String(next.captionsEnabled),
  );
  window.localStorage.setItem(
    storageKeys.effectsVolume,
    String(next.effectsVolume),
  );
  window.localStorage.setItem(
    storageKeys.masterVolume,
    String(next.masterVolume),
  );
  window.localStorage.setItem(
    storageKeys.musicVolume,
    String(next.musicVolume),
  );
  if (next.soundChoice !== "unset") {
    window.localStorage.setItem(
      storageKeys.soundChoice,
      next.soundChoice,
    );
  }

  cachedSnapshot = next;
  window.dispatchEvent(new Event(PREFERENCES_CHANGED_EVENT));
}

export function saveSoundChoice(
  soundChoice: Exclude<SoundChoice, "unset">,
) {
  const current = getGamePreferencesSnapshot();
  const masterVolume =
    soundChoice === "muted"
      ? 0
      : current.masterVolume > 0
        ? current.masterVolume
        : defaultGamePreferences.masterVolume;

  updateGamePreferences({ masterVolume, soundChoice });
}
