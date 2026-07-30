"use client";

import type { ReactNode } from "react";

import { GamePreferencesProvider } from "@/features/manage-game-preferences";
import { GameShell } from "@/widgets/game-shell";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GamePreferencesProvider>
      <GameShell>{children}</GameShell>
    </GamePreferencesProvider>
  );
}
