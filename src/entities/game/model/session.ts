import {
  endings,
  storyChapters,
  type EndingId,
  type StoryClip,
} from "./content";
import { resolveEndingFromChoices } from "./progress";
import type { ChoiceMap } from "./content";

export type PlaybackMode =
  | "chapterIntro"
  | "main"
  | "decision"
  | "branch"
  | "ending"
  | "endingNarration"
  | "complete";

export type GameState = {
  achievedEndingId: EndingId | null;
  chapterIndex: number;
  choiceHistory: number[];
  clipIndex: number;
  mode: PlaybackMode;
  selectedChoice: number | null;
};

export type GameAction =
  | { type: "chapterIntroFinished" }
  | { type: "mediaEnded" }
  | { type: "choiceSelected"; choiceIndex: 0 | 1 }
  | { type: "endingCompleted" };

export function createInitialGameState(): GameState {
  return {
    achievedEndingId: null,
    chapterIndex: 0,
    choiceHistory: [],
    clipIndex: 0,
    mode: "chapterIntro",
    selectedChoice: null,
  };
}

function advanceChapter(
  state: GameState,
  choiceHistory = state.choiceHistory,
): GameState {
  if (state.chapterIndex < storyChapters.length - 1) {
    return {
      ...state,
      chapterIndex: state.chapterIndex + 1,
      choiceHistory,
      clipIndex: 0,
      mode: "chapterIntro",
      selectedChoice: null,
    };
  }

  const achievedEndingId = resolveEndingFromChoices(choiceHistory);
  const ending = endings.find(({ id }) => id === achievedEndingId);

  return {
    ...state,
    achievedEndingId,
    choiceHistory,
    clipIndex: 0,
    mode: ending?.clips.length ? "ending" : "endingNarration",
    selectedChoice: null,
  };
}

export function gameReducer(
  state: GameState,
  action: GameAction,
): GameState {
  const chapter = storyChapters[state.chapterIndex];

  switch (action.type) {
    case "chapterIntroFinished":
      return {
        ...state,
        clipIndex: 0,
        mode: chapter.clips.length > 0 ? "main" : "decision",
      };

    case "choiceSelected": {
      if (!chapter.choices) return state;

      const choiceHistory = [
        ...state.choiceHistory,
        action.choiceIndex,
      ];
      const branchClips = chapter.choices[action.choiceIndex].clips;
      if (branchClips.length === 0) {
        return advanceChapter(state, choiceHistory);
      }

      return {
        ...state,
        choiceHistory,
        clipIndex: 0,
        mode: "branch",
        selectedChoice: action.choiceIndex,
      };
    }

    case "mediaEnded":
      if (state.mode === "main") {
        if (state.clipIndex < chapter.clips.length - 1) {
          return { ...state, clipIndex: state.clipIndex + 1 };
        }
        if (chapter.choices) {
          return { ...state, clipIndex: 0, mode: "decision" };
        }
        return advanceChapter(state);
      }

      if (
        state.mode === "branch" &&
        state.selectedChoice !== null &&
        chapter.choices
      ) {
        const branchClips =
          chapter.choices[state.selectedChoice].clips;
        return state.clipIndex < branchClips.length - 1
          ? { ...state, clipIndex: state.clipIndex + 1 }
          : advanceChapter(state);
      }

      if (state.mode === "ending" && state.achievedEndingId) {
        const ending = endings.find(
          ({ id }) => id === state.achievedEndingId,
        );
        if (!ending) return state;

        return state.clipIndex < ending.clips.length - 1
          ? { ...state, clipIndex: state.clipIndex + 1 }
          : { ...state, mode: "endingNarration" };
      }

      return state;

    case "endingCompleted":
      return state.achievedEndingId
        ? { ...state, mode: "complete" }
        : state;
  }
}

export function selectChapter(state: GameState) {
  return storyChapters[state.chapterIndex];
}

export function selectActiveEnding(state: GameState) {
  return state.achievedEndingId
    ? endings.find(({ id }) => id === state.achievedEndingId)
    : undefined;
}

export function selectResolvedEnding(state: GameState) {
  const endingId =
    state.achievedEndingId ??
    resolveEndingFromChoices(state.choiceHistory);

  return endings.find(({ id }) => id === endingId);
}

export function selectActiveClip(state: GameState): StoryClip | undefined {
  const chapter = selectChapter(state);

  if (state.mode === "main") {
    return chapter.clips[state.clipIndex];
  }

  if (
    state.mode === "branch" &&
    state.selectedChoice !== null &&
    chapter.choices
  ) {
    return chapter.choices[state.selectedChoice].clips[state.clipIndex];
  }

  if (state.mode === "ending") {
    return selectActiveEnding(state)?.clips[state.clipIndex];
  }
}

export function selectCurrentChoices(state: GameState): ChoiceMap {
  const choices: ChoiceMap = {};
  let decisionIndex = 0;

  for (const chapter of storyChapters) {
    if (!chapter.decisionId || !chapter.choices) continue;

    const selectedChoice = state.choiceHistory[decisionIndex];
    if (selectedChoice === 0 || selectedChoice === 1) {
      choices[chapter.decisionId] = selectedChoice;
    }
    decisionIndex += 1;
  }

  return choices;
}
