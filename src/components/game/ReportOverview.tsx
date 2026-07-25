import { Check, Lock } from "lucide-react";

import type {
  ChoiceMap,
  ReportData,
} from "@/lib/report-types";
import { cn } from "@/lib/utils";

type ReportOverviewProps = {
  data: ReportData;
  selectedChoices?: ChoiceMap;
  className?: string;
  compact?: boolean;
};

export function ReportOverview({
  data,
  selectedChoices = {},
  className,
  compact = false,
}: ReportOverviewProps) {
  return (
    <section
      aria-label="선택 통계"
      className={cn("grid gap-4", className)}
    >
      {data.choices.map((decision) => {
        const selectedChoice = selectedChoices[decision.decisionId];
        const locked = selectedChoice === undefined;

        return (
          <article
            aria-label={
              locked
                ? `${decision.day} 리포트 잠김`
                : `${decision.day} 선택 리포트`
            }
            className={cn(
              "report-card-reveal ui-card-glow relative overflow-hidden rounded-3xl border border-white/14 bg-black/42 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 ease-in-out hover:scale-[1.02]",
              locked && "border-white/8 bg-black/52",
              compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
            )}
            key={decision.decisionId}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-white/58">
                  {decision.day}
                </p>
                <h2
                  className={cn(
                    "mt-1 font-bold tracking-tight text-white",
                    compact ? "text-base sm:text-lg" : "text-lg sm:text-xl",
                  )}
                >
                  {decision.prompt}
                </h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {locked ? (
                  <Lock
                    aria-hidden="true"
                    className="size-4 text-white/52"
                  />
                ) : null}
                <span className="text-xs tabular-nums text-white/58">
                  {decision.total.toLocaleString()}회
                </span>
              </div>
            </div>

            {locked ? (
              <div className="mt-5 flex min-h-20 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[.025] px-4 text-center text-sm font-medium text-white/58">
                게임에서 선택하면 리포트가 공개됩니다.
              </div>
            ) : (
              <div
                className={cn(
                  "grid",
                  compact ? "mt-4 gap-3" : "mt-5 gap-4",
                )}
              >
                {decision.choices.map((choice, index) => {
                  const selected = selectedChoice === index;

                  return (
                    <div key={choice.label}>
                      <div className="mb-2 flex items-end justify-between gap-4">
                        <p
                          className={cn(
                            "flex items-center gap-1.5 text-sm",
                            selected
                              ? "font-bold text-white"
                              : "font-medium text-white/68",
                          )}
                        >
                          {selected ? (
                            <Check
                              aria-hidden="true"
                              className="size-4 text-[#ef4444]"
                            />
                          ) : null}
                          <span>{choice.label}</span>
                          {selected ? (
                            <span className="text-xs text-[#f87171]">
                              당신과 {choice.percentage}%의 사람들이 이
                              대답을 선택했습니다
                            </span>
                          ) : null}
                        </p>
                        <strong className="text-sm tabular-nums text-white">
                          {choice.percentage}%
                        </strong>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          aria-hidden="true"
                          className={cn(
                            "report-bar-fill h-full rounded-full",
                            selected ? "bg-[#ef4444]" : "bg-white/58",
                          )}
                          style={{
                            animationDelay: `${0.2 + index * 0.12}s`,
                            width: `${choice.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
