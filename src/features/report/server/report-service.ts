import {
  decisionDefinitions,
  decisionIds,
  endings,
} from "@/data/game";
import {
  emptyEndingCounts,
  type ReportData,
} from "@/lib/report-types";

import type { ReportRepository } from "./report-repository";

export type ReportEventInput =
  | {
      type: "choice";
      choiceIndex: 0 | 1;
      decisionId: string;
      playerId: string;
    }
  | {
      type: "ending";
      endingId: string;
      playerId: string;
    };

const decisionIdSet = new Set<string>(decisionIds);
const endingIdSet = new Set<string>(endings.map(({ id }) => id));

export class InvalidReportEventError extends Error {}

function percentage(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

export async function loadReportData(
  repository: ReportRepository,
): Promise<ReportData> {
  const [choiceRows, endingRows] = await Promise.all([
    repository.getChoiceCounts(),
    repository.getEndingCounts(),
  ]);

  const choiceCounts = new Map<string, number>();
  for (const row of choiceRows) {
    choiceCounts.set(
      `${row.decisionId}:${row.choiceIndex}`,
      row.count,
    );
  }

  const endingCounts = { ...emptyEndingCounts };
  for (const row of endingRows) {
    if (endingIdSet.has(row.endingId)) {
      endingCounts[row.endingId as keyof typeof endingCounts] =
        row.count;
    }
  }

  return {
    choices: decisionDefinitions.map((decision) => {
      const firstCount =
        choiceCounts.get(`${decision.id}:0`) ?? 0;
      const secondCount =
        choiceCounts.get(`${decision.id}:1`) ?? 0;
      const total = firstCount + secondCount;

      return {
        decisionId: decision.id,
        day: decision.day,
        title: decision.title,
        prompt: decision.prompt,
        total,
        choices: [
          {
            label: decision.choices[0],
            count: firstCount,
            percentage: percentage(firstCount, total),
          },
          {
            label: decision.choices[1],
            count: secondCount,
            percentage: percentage(secondCount, total),
          },
        ],
      };
    }),
    endings: endingCounts,
  };
}

export async function saveReportEvent(
  repository: ReportRepository,
  event: ReportEventInput,
) {
  if (
    event.type === "choice" &&
    decisionIdSet.has(event.decisionId)
  ) {
    await repository.createChoice({
      choiceIndex: event.choiceIndex,
      decisionId: event.decisionId,
      playerId: event.playerId,
    });
    return;
  }

  if (
    event.type === "ending" &&
    endingIdSet.has(event.endingId)
  ) {
    await repository.createEnding({
      endingId: event.endingId,
      playerId: event.playerId,
    });
    return;
  }

  throw new InvalidReportEventError("잘못된 리포트 이벤트입니다.");
}
