import { describe, expect, it } from "vitest";

import { createStorySessionStore } from "./story-session-store";

describe("story session store", () => {
  it("owns reducer transitions for one story route session", () => {
    const store = createStorySessionStore();

    store
      .getState()
      .dispatchGame({ type: "chapterIntroFinished" });
    store.getState().dispatchGame({ type: "mediaEnded" });

    expect(store.getState().gameState).toMatchObject({
      chapterIndex: 0,
      clipIndex: 1,
      mode: "main",
    });
  });

  it("resets without affecting another route session", () => {
    const firstSession = createStorySessionStore();
    const secondSession = createStorySessionStore();

    firstSession
      .getState()
      .dispatchGame({ type: "chapterIntroFinished" });
    firstSession.getState().resetGame();

    expect(firstSession.getState().gameState).toEqual(
      secondSession.getState().gameState,
    );
  });
});
