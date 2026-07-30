"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import {
  createInitialGameState,
  gameReducer,
  type GameAction,
  type GameState,
} from "@/entities/game";

export type StorySessionStore = {
  gameState: GameState;
  dispatchGame: (action: GameAction) => void;
  resetGame: () => void;
};

export function createStorySessionStore(
  initialState = createInitialGameState(),
) {
  return createStore<StorySessionStore>()((set) => ({
    gameState: initialState,
    dispatchGame: (action) =>
      set((state) => ({
        gameState: gameReducer(state.gameState, action),
      })),
    resetGame: () => set({ gameState: createInitialGameState() }),
  }));
}

type StorySessionStoreApi = ReturnType<
  typeof createStorySessionStore
>;

const StorySessionContext =
  createContext<StorySessionStoreApi | null>(null);

export function StorySessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState(createStorySessionStore);

  return (
    <StorySessionContext.Provider value={store}>
      {children}
    </StorySessionContext.Provider>
  );
}

export function useStorySession<T>(
  selector: (state: StorySessionStore) => T,
) {
  const store = useContext(StorySessionContext);

  if (!store) {
    throw new Error(
      "useStorySession must be used within StorySessionProvider",
    );
  }

  return useStore(store, selector);
}
