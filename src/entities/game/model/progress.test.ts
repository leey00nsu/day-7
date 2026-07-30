import { describe, expect, it } from "vitest";

import {
  parseLastEndingId,
  parseUnlockedEndingIds,
  resolveEndingFromChoices,
} from "./progress";

describe("ending progress", () => {
  it.each([
    [[0, 0, 0, 0], "E01"],
    [[1, 0, 0, 0], "E01"],
    [[1, 1, 0, 0], "E02"],
    [[1, 1, 1, 0], "E02"],
    [[1, 1, 1, 1], "E03"],
  ] as const)("resolves %j to %s", (choices, endingId) => {
    expect(resolveEndingFromChoices(choices)).toBe(endingId);
  });

  it("filters malformed stored ending progress", () => {
    expect(
      parseUnlockedEndingIds('["E01","unknown","E03","E01",null]'),
    ).toEqual(["E01", "E03", "E01"]);
    expect(parseUnlockedEndingIds("not-json")).toEqual([]);
  });

  it("accepts only known last endings", () => {
    expect(parseLastEndingId("E02")).toBe("E02");
    expect(parseLastEndingId("E99")).toBeNull();
  });
});
