import { cn } from "@/lib/utils";

type DecisionOverlayProps = {
  choices: readonly [string, string];
  remainingSeconds?: number;
  durationSeconds?: number;
  onChoose?: (index: number) => void;
  className?: string;
};

export function DecisionOverlay({
  choices,
  remainingSeconds = 10,
  durationSeconds = 10,
  onChoose,
  className,
}: DecisionOverlayProps) {
  const progress = Math.max(
    0,
    Math.min(100, (remainingSeconds / durationSeconds) * 100),
  );

  return (
    <fieldset
      className={cn("absolute inset-0 z-30", className)}
      aria-label="행동 선택"
    >
      <legend className="sr-only">다음 행동을 선택하세요</legend>
      {choices.map((choice, index) => (
        <button
          className={cn(
            "absolute top-1/2 w-[min(34vw,360px)] -translate-y-1/2 rounded-2xl border border-white/32 bg-black/45 px-5 py-4 text-center text-sm font-semibold leading-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-200 hover:-translate-y-[calc(50%+2px)] hover:border-white/65 hover:bg-black/62 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-7 sm:py-5 sm:text-base",
            index === 0 ? "left-[4vw]" : "right-[4vw]",
          )}
          key={choice}
          onClick={() => onChoose?.(index)}
          type="button"
        >
          {choice}
        </button>
      ))}

      <div
        aria-label={`선택 제한 시간 ${remainingSeconds}초`}
        className="absolute bottom-[clamp(1.25rem,4vh,3rem)] left-1/2 w-[min(72vw,320px)] -translate-x-1/2 text-center"
      >
        <p className="text-sm font-semibold tabular-nums text-white [text-shadow:0_2px_8px_#000]">
          {remainingSeconds}초
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/25 shadow-lg shadow-black/30">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </fieldset>
  );
}
