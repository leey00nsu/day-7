"use client";

import { useReportData } from "../model/use-report-data";
import type { ReportData } from "../model/types";
import { ReportOverview } from "./ReportOverview";

type ReportDashboardProps = {
  initialData?: ReportData;
};

export function ReportDashboard({
  initialData,
}: ReportDashboardProps) {
  const { choices, data, error, loading } =
    useReportData(initialData);

  if (loading && !data) {
    return (
      <p className="my-auto py-16 text-center text-white/68">
        선택 기록을 불러오는 중입니다.
      </p>
    );
  }

  if (error || !data) {
    return (
      <p
        className="my-auto py-16 text-center text-white/68"
        role="alert"
      >
        리포트를 불러오지 못했습니다.
      </p>
    );
  }

  return (
    <div className="py-10">
      <ReportOverview data={data} selectedChoices={choices} />
    </div>
  );
}
