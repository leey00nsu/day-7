import { describe, expect, it } from "vitest";

import {
  createGamePreferencesStore,
  readGamePreferences,
} from "./preferences-store";

function storage(values: Record<string, string>) {
  return {
    getItem(key: string) {
      return values[key] ?? null;
    },
  };
}

describe("game preferences", () => {
  it("reads and clamps persisted settings", () => {
    expect(
      readGamePreferences(
        storage({
          "game-caption-size": "120",
          "game-captions": "false",
          "game-effects-volume": "-5",
          "game-music-volume": "not-a-number",
          "game-sound-choice": "enabled",
          "game-volume": "140",
        }),
      ),
    ).toEqual({
      captionSize: 120,
      captionsEnabled: false,
      effectsVolume: 0,
      masterVolume: 100,
      musicVolume: 28,
      soundChoice: "enabled",
    });
  });

  it("uses compact caption defaults when appropriate", () => {
    expect(readGamePreferences(storage({}), true)).toMatchObject({
      captionSize: 75,
      captionsEnabled: true,
      soundChoice: "unset",
    });
  });

  it("updates settings and restores an audible volume", () => {
    const store = createGamePreferencesStore();

    store.getState().updatePreferences({ captionSize: 125 });
    store.getState().saveSoundChoice("muted");

    expect(store.getState()).toMatchObject({
      captionSize: 125,
      masterVolume: 0,
      soundChoice: "muted",
    });

    store.getState().saveSoundChoice("enabled");

    expect(store.getState()).toMatchObject({
      masterVolume: 80,
      soundChoice: "enabled",
    });
  });
});
