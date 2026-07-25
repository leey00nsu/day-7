import { NextResponse } from "next/server";

import {
  decisionDefinitions,
  decisionIds,
  endings,
} from "@/data/game";
import { getDatabase } from "@/lib/db";
import {
  emptyEndingCounts,
  type ReportData,
} from "@/lib/report-types";
import {
  parseReportRequest,
  ReportRequestError,
} from "@/lib/report-request";

export const dynamic = "force-dynamic";

const decisionIdSet = new Set<string>(decisionIds);
const endingIdSet = new Set<string>(endings.map((ending) => ending.id));

function percentage(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

export async function GET() {
  try {
    const database = getDatabase();
    const [choiceRows, endingRows] = await Promise.all([
      database.gameChoiceResponse.groupBy({
        by: ["decisionId", "choiceIndex"],
        _count: {
          _all: true,
        },
      }),
      database.gameEndingResponse.groupBy({
        by: ["endingId"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const choiceCounts = new Map<string, number>();
    for (const row of choiceRows) {
      choiceCounts.set(
        `${row.decisionId}:${row.choiceIndex}`,
        row._count._all,
      );
    }

    const endingCounts = { ...emptyEndingCounts };
    for (const row of endingRows) {
      if (endingIdSet.has(row.endingId)) {
        endingCounts[row.endingId as keyof typeof endingCounts] =
          row._count._all;
      }
    }

    const data: ReportData = {
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

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, max-age=0, s-maxage=15, stale-while-revalidate=45",
      },
    });
  } catch (error) {
    console.error("Failed to load report data", error);
    return NextResponse.json(
      { message: "리포트를 불러오지 못했습니다." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseReportRequest(request);
    const database = getDatabase();

    if (
      body.type === "choice" &&
      decisionIdSet.has(body.decisionId)
    ) {
      await database.gameChoiceResponse.create({
        data: {
          playerId: body.playerId,
          decisionId: body.decisionId,
          choiceIndex: body.choiceIndex,
        },
      });

      return NextResponse.json({ saved: true });
    }

    if (
      body.type === "ending" &&
      endingIdSet.has(body.endingId)
    ) {
      await database.gameEndingResponse.create({
        data: {
          playerId: body.playerId,
          endingId: body.endingId,
        },
      });

      return NextResponse.json({ saved: true });
    }

    throw new ReportRequestError("잘못된 리포트 이벤트입니다.", 400);
  } catch (error) {
    if (error instanceof ReportRequestError) {
      return NextResponse.json(
        { message: error.message },
        {
          status: error.status,
          headers: error.headers,
        },
      );
    }

    console.error("Failed to save report event", error);
    return NextResponse.json(
      { message: "리포트 기록을 저장하지 못했습니다." },
      { status: 503 },
    );
  }
}
