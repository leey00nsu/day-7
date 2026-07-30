"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStore } from "zustand";

import {
  createGamePreferencesStore,
  migrateLegacyGamePreferences,
  type GamePreferencesStore,
  type GamePreferencesStoreApi,
} from "./preferences-store";

const GamePreferencesContext =
  createContext<GamePreferencesStoreApi | null>(null);

export function GamePreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState(createGamePreferencesStore);

  useEffect(() => {
    const compactCaptions = window.matchMedia(
      "(max-width: 767px), (pointer: coarse) and (max-width: 1024px)",
    ).matches;

    migrateLegacyGamePreferences(
      store,
      window.localStorage,
      compactCaptions,
    );

    Promise.resolve(store.persist.rehydrate()).finally(() => {
      store.getState().markHydrated();
    });
  }, [store]);

  return (
    <GamePreferencesContext.Provider value={store}>
      {children}
    </GamePreferencesContext.Provider>
  );
}

export function useGamePreferences<T>(
  selector: (state: GamePreferencesStore) => T,
) {
  const store = useContext(GamePreferencesContext);

  if (!store) {
    throw new Error(
      "useGamePreferences must be used within GamePreferencesProvider",
    );
  }

  return useStore(store, selector);
}
