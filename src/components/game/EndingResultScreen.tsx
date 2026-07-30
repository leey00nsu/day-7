"use client";

import Link from "next/link";

import { EndingCard } from "@/components/game/EndingCard";
import { ReportOverview } from "@/components/game/ReportOverview";
import type { Ending } from "@/entities/game";
import { buttonVariants } from "@/shared/ui/button";
import { useReportData } from "@/hooks/use-report-data";
import type { ChoiceMap, ReportData } from "@/lib/report-types";

type EndingResultScreenProps = {
  ending: Ending;
  currentChoices: ChoiceMap;
  initialReportData?: ReportData;
};

export function EndingResultScreen({
  ending,
  currentChoices,
  initialReportData,
}: EndingResultScreenProps) {
  const { data, error, loading } = useReportData(initialReportData);

  return (
    <section className="absolute inset-0 z-30 cursor-default overflow-y-auto bg-black px-5 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-start gap-8">
          <EndingCard
            className="mx-auto w-full max-w-3xl"
            ending={ending}
            isLatestEnding
            reachCount={data?.endings[ending.id]}
            unlocked
          />

          <div className="mx-auto w-full max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/52">
              MY CHOICES
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              나의 선택과 다른 사람들
            </h2>

            {loading && !data ? (
              <p className="mt-8 text-sm text-white/58">
                선택 기록을 불러오는 중입니다.
              </p>
            ) : null}
            {error && !data ? (
              <p className="mt-8 text-sm text-white/58" role="alert">
                리포트를 불러오지 못했습니다.
              </p>
            ) : null}
            {data ? (
              <ReportOverview
                className="mt-6"
                compact
                data={data}
                selectedChoices={currentChoices}
              />
            ) : null}
          </div>
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            className={buttonVariants({
              variant: "outline",
              size: "lg",
            })}
            href="/endings"
          >
            앨범 보기
          </Link>
          <Link
            className={buttonVariants({
              variant: "outline",
              size: "lg",
            })}
            href="/report"
          >
            전체 리포트
          </Link>
          <Link
            className={buttonVariants({
              variant: "outline",
              size: "lg",
            })}
            href="/"
          >
            홈으로
          </Link>
        </div>
      </div>
    </section>
  );
}
