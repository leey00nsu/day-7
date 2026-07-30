import type {
  ChoiceMap,
  DecisionId,
  EndingId,
} from "@/entities/game";

export type { ChoiceMap };

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

export const emptyEndingCounts: Record<EndingId, number> = {
  E01: 0,
  E02: 0,
  E03: 0,
};
