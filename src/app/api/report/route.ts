import { NextResponse } from "next/server";

import {
  createPrismaReportRepository,
} from "@/features/report/server/report-repository";
import {
  InvalidReportEventError,
  loadReportData,
  saveReportEvent,
} from "@/features/report/server/report-service";
import {
  parseReportRequest,
  ReportRequestError,
} from "@/lib/report-request";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await loadReportData(
      createPrismaReportRepository(),
    );

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
    await saveReportEvent(createPrismaReportRepository(), body);
    return NextResponse.json({ saved: true });
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

    if (error instanceof InvalidReportEventError) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 },
      );
    }

    console.error("Failed to save report event", error);
    return NextResponse.json(
      { message: "리포트 기록을 저장하지 못했습니다." },
      { status: 503 },
    );
  }
}
