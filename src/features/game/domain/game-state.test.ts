import { describe, expect, it } from "vitest";

import {
  createInitialGameState,
  gameReducer,
  selectActiveClip,
  selectCurrentChoices,
} from "./game-state";

function finishChapterIntro(state = createInitialGameState()) {
  return gameReducer(state, { type: "chapterIntroFinished" });
}

describe("game reducer", () => {
  it("advances from the prologue to Monday", () => {
    let state = finishChapterIntro();

    state = gameReducer(state, { type: "mediaEnded" });
    state = gameReducer(state, { type: "mediaEnded" });
    state = gameReducer(state, { type: "mediaEnded" });

    expect(state).toMatchObject({
      chapterIndex: 1,
      clipIndex: 0,
      mode: "chapterIntro",
    });
  });

  it("moves through a decision and its branch", () => {
    let state = {
      ...createInitialGameState(),
      chapterIndex: 1,
    };
    state = finishChapterIntro(state);

    state = gameReducer(state, { type: "mediaEnded" });
    state = gameReducer(state, { type: "mediaEnded" });
    state = gameReducer(state, { type: "mediaEnded" });
    expect(state.mode).toBe("decision");

    state = gameReducer(state, {
      type: "choiceSelected",
      choiceIndex: 1,
    });
    expect(state).toMatchObject({
      choiceHistory: [1],
      mode: "branch",
      selectedChoice: 1,
    });
    expect(selectActiveClip(state)?.filename).toBe(
      "c01_a_complete_s01.mp4",
    );

    state = gameReducer(state, { type: "mediaEnded" });
    expect(state).toMatchObject({
      chapterIndex: 2,
      mode: "chapterIntro",
    });
  });

  it("skips directly to Friday after a branch without clips", () => {
    const state = gameReducer(
      {
        ...createInitialGameState(),
        chapterIndex: 4,
        choiceHistory: [1, 0, 1],
        mode: "decision",
      },
      { type: "choiceSelected", choiceIndex: 0 },
    );

    expect(state).toMatchObject({
      chapterIndex: 5,
      choiceHistory: [1, 0, 1, 0],
      mode: "chapterIntro",
    });
  });

  it("resolves and completes an ending", () => {
    let state = {
      ...createInitialGameState(),
      chapterIndex: 5,
      choiceHistory: [1, 1, 1, 1],
      clipIndex: 1,
      mode: "main" as const,
    };

    state = gameReducer(state, { type: "mediaEnded" });
    expect(state).toMatchObject({
      achievedEndingId: "E03",
      clipIndex: 0,
      mode: "ending",
    });

    state = gameReducer(state, { type: "mediaEnded" });
    state = gameReducer(state, { type: "mediaEnded" });
    state = gameReducer(state, { type: "mediaEnded" });
    expect(state.mode).toBe("endingNarration");

    state = gameReducer(state, { type: "endingCompleted" });
    expect(state.mode).toBe("complete");
  });

  it("maps recorded choices to decision identifiers", () => {
    expect(
      selectCurrentChoices({
        ...createInitialGameState(),
        choiceHistory: [1, 0, 1, 0],
      }),
    ).toEqual({
      MONDAY_STATUS: 1,
      TUESDAY_OVERTIME: 0,
      WEDNESDAY_BLAME: 1,
      THURSDAY_CREDIT: 0,
    });
  });
});
