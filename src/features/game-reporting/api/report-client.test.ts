import { describe, expect, it } from "vitest";

import { parseChoices } from "./report-client";

describe("stored game report choices", () => {
  it("keeps binary choice values", () => {
    expect(
      parseChoices(
        JSON.stringify({
          MONDAY_STATUS: 0,
          TUESDAY_OVERTIME: 1,
          WEDNESDAY_BLAME: 2,
          THURSDAY_CREDIT: "1",
        }),
      ),
    ).toEqual({
      MONDAY_STATUS: 0,
      TUESDAY_OVERTIME: 1,
    });
  });

  it.each(["null", "[]", "not-json"])(
    "returns an empty map for %s",
    (storedValue) => {
      expect(parseChoices(storedValue)).toEqual({});
    },
  );
});
