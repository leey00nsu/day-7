import { describe, expect, it } from "vitest";

import {
  decisionDefinitions,
  decisionIds,
  endings,
  storyChapters,
} from "./game";

describe("game content", () => {
  it("defines every decision exactly once", () => {
    expect(decisionDefinitions.map(({ id }) => id)).toEqual(decisionIds);
    expect(new Set(decisionIds).size).toBe(decisionIds.length);
  });

  it("keeps every decision binary and reportable", () => {
    const decisionChapters = storyChapters.filter(
      (chapter) => chapter.decisionId,
    );

    expect(decisionChapters).toHaveLength(decisionIds.length);
    for (const chapter of decisionChapters) {
      expect(chapter.decisionPrompt).toBeTruthy();
      expect(chapter.choices).toHaveLength(2);
    }
  });

  it("uses unique ending identifiers", () => {
    const endingIds = endings.map(({ id }) => id);

    expect(endingIds).toEqual(["E01", "E02", "E03"]);
    expect(new Set(endingIds).size).toBe(endingIds.length);
  });
});
