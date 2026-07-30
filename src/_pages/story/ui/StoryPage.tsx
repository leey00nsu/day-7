import { StorySessionProvider } from "../model/story-session-store";
import { GameScene } from "./GameScene";

export function StoryPage() {
  return (
    <StorySessionProvider>
      <GameScene />
    </StorySessionProvider>
  );
}
