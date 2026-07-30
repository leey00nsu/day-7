import { createStore } from "zustand/vanilla";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

export type SoundChoice = "unset" | "enabled" | "muted";

export type GamePreferences = {
  captionSize: number;
  captionsEnabled: boolean;
  effectsVolume: number;
  masterVolume: number;
  musicVolume: number;
  soundChoice: SoundChoice;
};

export type GamePreferencesStore = GamePreferences & {
  hasHydrated: boolean;
  markHydrated: () => void;
  saveSoundChoice: (
    soundChoice: Exclude<SoundChoice, "unset">,
  ) => void;
  updatePreferences: (patch: Partial<GamePreferences>) => void;
};

const legacyStorageKeys = {
  captionSize: "game-caption-size",
  captionsEnabled: "game-captions",
  effectsVolume: "game-effects-volume",
  masterVolume: "game-volume",
  musicVolume: "game-music-volume",
  soundChoice: "game-sound-choice",
} as const;

export const GAME_PREFERENCES_STORAGE_KEY = "d7-game-preferences";
export const GAME_PREFERENCES_STORAGE_VERSION = 1;

export const defaultGamePreferences: GamePreferences = {
  captionSize: 100,
  captionsEnabled: true,
  effectsVolume: 40,
  masterVolume: 80,
  musicVolume: 28,
  soundChoice: "unset",
};

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

function clampPersistedNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  return clampNumber(
    typeof value === "number" || typeof value === "string"
      ? String(value)
      : null,
    fallback,
    minimum,
    maximum,
  );
}

export function readGamePreferences(
  storage: Pick<Storage, "getItem">,
  compactCaptions = false,
): GamePreferences {
  const soundChoice = storage.getItem(legacyStorageKeys.soundChoice);

  return {
    captionSize: clampNumber(
      storage.getItem(legacyStorageKeys.captionSize),
      compactCaptions ? 75 : 100,
      75,
      150,
    ),
    captionsEnabled:
      storage.getItem(legacyStorageKeys.captionsEnabled) !== "false",
    effectsVolume: clampNumber(
      storage.getItem(legacyStorageKeys.effectsVolume),
      defaultGamePreferences.effectsVolume,
      0,
      100,
    ),
    masterVolume: clampNumber(
      storage.getItem(legacyStorageKeys.masterVolume),
      defaultGamePreferences.masterVolume,
      0,
      100,
    ),
    musicVolume: clampNumber(
      storage.getItem(legacyStorageKeys.musicVolume),
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

function normalizePersistedPreferences(
  persistedState: unknown,
  fallback: GamePreferences,
): GamePreferences {
  const persisted =
    persistedState && typeof persistedState === "object"
      ? (persistedState as Partial<GamePreferences>)
      : {};

  return {
    captionSize: clampPersistedNumber(
      persisted.captionSize,
      fallback.captionSize,
      75,
      150,
    ),
    captionsEnabled:
      typeof persisted.captionsEnabled === "boolean"
        ? persisted.captionsEnabled
        : fallback.captionsEnabled,
    effectsVolume: clampPersistedNumber(
      persisted.effectsVolume,
      fallback.effectsVolume,
      0,
      100,
    ),
    masterVolume: clampPersistedNumber(
      persisted.masterVolume,
      fallback.masterVolume,
      0,
      100,
    ),
    musicVolume: clampPersistedNumber(
      persisted.musicVolume,
      fallback.musicVolume,
      0,
      100,
    ),
    soundChoice:
      persisted.soundChoice === "enabled" ||
      persisted.soundChoice === "muted"
        ? persisted.soundChoice
        : fallback.soundChoice,
  };
}

type CreateGamePreferencesStoreOptions = {
  storage?: StateStorage;
};

export function createGamePreferencesStore(
  options: CreateGamePreferencesStoreOptions = {},
) {
  const persistedStorage = createJSONStorage(() => {
    if (options.storage) return options.storage;
    return window.localStorage;
  });

  return createStore<GamePreferencesStore>()(
    persist(
      (set, get) => ({
        ...defaultGamePreferences,
        hasHydrated: false,
        markHydrated: () => set({ hasHydrated: true }),
        updatePreferences: (patch) => set(patch),
        saveSoundChoice: (soundChoice) => {
          const currentMasterVolume = get().masterVolume;
          const masterVolume =
            soundChoice === "muted"
              ? 0
              : currentMasterVolume > 0
                ? currentMasterVolume
                : defaultGamePreferences.masterVolume;

          set({ masterVolume, soundChoice });
        },
      }),
      {
        name: GAME_PREFERENCES_STORAGE_KEY,
        version: GAME_PREFERENCES_STORAGE_VERSION,
        storage: persistedStorage,
        skipHydration: true,
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...normalizePersistedPreferences(
            persistedState,
            currentState,
          ),
        }),
        partialize: (state) => ({
          captionSize: state.captionSize,
          captionsEnabled: state.captionsEnabled,
          effectsVolume: state.effectsVolume,
          masterVolume: state.masterVolume,
          musicVolume: state.musicVolume,
          soundChoice: state.soundChoice,
        }),
      },
    ),
  );
}

export type GamePreferencesStoreApi = ReturnType<
  typeof createGamePreferencesStore
>;

export function migrateLegacyGamePreferences(
  store: GamePreferencesStoreApi,
  storage: Storage,
  compactCaptions = false,
) {
  if (storage.getItem(GAME_PREFERENCES_STORAGE_KEY) !== null) {
    return false;
  }

  store.setState(readGamePreferences(storage, compactCaptions));
  return true;
}
