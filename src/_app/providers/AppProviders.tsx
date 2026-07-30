"use client";

import type { ReactNode } from "react";

import { GameShell } from "@/widgets/game-shell";

export function AppProviders({ children }: { children: ReactNode }) {
  return <GameShell>{children}</GameShell>;
}
