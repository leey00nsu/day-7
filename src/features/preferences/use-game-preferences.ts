"use client";

import { useSyncExternalStore } from "react";

import {
  defaultGamePreferences,
  getGamePreferencesSnapshot,
  subscribeToGamePreferences,
} from "./game-preferences-store";

export function useGamePreferences() {
  return useSyncExternalStore(
    subscribeToGamePreferences,
    getGamePreferencesSnapshot,
    () => defaultGamePreferences,
  );
}
