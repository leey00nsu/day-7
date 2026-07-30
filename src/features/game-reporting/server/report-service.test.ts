import { describe, expect, it, vi } from "vitest";

import type { ReportRepository } from "./report-repository";
import {
  InvalidReportEventError,
  loadReportData,
  saveReportEvent,
} from "./report-service";

function createRepository(
  overrides: Partial<ReportRepository> = {},
): ReportRepository {
  return {
    createChoice: vi.fn(),
    createEnding: vi.fn(),
    getChoiceCounts: vi.fn().mockResolvedValue([]),
    getEndingCounts: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("game report service", () => {
  it("builds report percentages from repository counts", async () => {
    const repository = createRepository({
      getChoiceCounts: vi.fn().mockResolvedValue([
        {
          choiceIndex: 0,
          count: 1,
          decisionId: "MONDAY_STATUS",
        },
        {
          choiceIndex: 1,
          count: 3,
          decisionId: "MONDAY_STATUS",
        },
      ]),
      getEndingCounts: vi.fn().mockResolvedValue([
        { count: 2, endingId: "E01" },
        { count: 5, endingId: "unknown" },
      ]),
    });

    const report = await loadReportData(repository);

    expect(report.choices[0]).toMatchObject({
      total: 4,
      choices: [
        { count: 1, percentage: 25 },
        { count: 3, percentage: 75 },
      ],
    });
    expect(report.endings).toEqual({ E01: 2, E02: 0, E03: 0 });
  });

  it("records every ending event so repeat plays accumulate", async () => {
    const repository = createRepository();
    const event = {
      type: "ending" as const,
      endingId: "E02",
      playerId: "ed39adf7-5c97-49d0-ab52-a6ae55f40ed1",
    };

    await saveReportEvent(repository, event);
    await saveReportEvent(repository, event);

    expect(repository.createEnding).toHaveBeenCalledTimes(2);
  });

  it("rejects identifiers outside the game definition", async () => {
    const repository = createRepository();

    await expect(
      saveReportEvent(repository, {
        type: "ending",
        endingId: "E99",
        playerId: "ed39adf7-5c97-49d0-ab52-a6ae55f40ed1",
      }),
    ).rejects.toBeInstanceOf(InvalidReportEventError);
  });
});
