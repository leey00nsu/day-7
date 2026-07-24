import type { Metadata } from "next";

import { GameScene } from "@/components/game/GameScene";

export const metadata: Metadata = {
  title: "스토리",
};

export default function StoryPage() {
  return <GameScene />;
}
