import type { DecisionId, EndingId } from "@/data/game";

export type ChoiceReport = {
  decisionId: DecisionId;
  day: string;
  title: string;
  prompt: string;
  total: number;
  choices: readonly [
    { label: string; count: number; percentage: number },
    { label: string; count: number; percentage: number },
  ];
};

export type ReportData = {
  choices: ChoiceReport[];
  endings: Record<EndingId, number>;
};

export type ChoiceMap = Partial<Record<DecisionId, 0 | 1>>;

export const emptyEndingCounts: Record<EndingId, number> = {
  E01: 0,
  E02: 0,
  E03: 0,
};
