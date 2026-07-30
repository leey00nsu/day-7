import "server-only";

import { getDatabase } from "@/lib/db";

export type ChoiceCountRow = {
  count: number;
  choiceIndex: number;
  decisionId: string;
};

export type EndingCountRow = {
  count: number;
  endingId: string;
};

export type ReportRepository = {
  createChoice(input: {
    choiceIndex: 0 | 1;
    decisionId: string;
    playerId: string;
  }): Promise<void>;
  createEnding(input: {
    endingId: string;
    playerId: string;
  }): Promise<void>;
  getChoiceCounts(): Promise<ChoiceCountRow[]>;
  getEndingCounts(): Promise<EndingCountRow[]>;
};

export function createPrismaReportRepository(): ReportRepository {
  const database = getDatabase();

  return {
    async createChoice(input) {
      await database.gameChoiceResponse.create({ data: input });
    },
    async createEnding(input) {
      await database.gameEndingResponse.create({ data: input });
    },
    async getChoiceCounts() {
      const rows = await database.gameChoiceResponse.groupBy({
        by: ["decisionId", "choiceIndex"],
        _count: { _all: true },
      });

      return rows.map((row) => ({
        choiceIndex: row.choiceIndex,
        count: row._count._all,
        decisionId: row.decisionId,
      }));
    },
    async getEndingCounts() {
      const rows = await database.gameEndingResponse.groupBy({
        by: ["endingId"],
        _count: { _all: true },
      });

      return rows.map((row) => ({
        count: row._count._all,
        endingId: row.endingId,
      }));
    },
  };
}
