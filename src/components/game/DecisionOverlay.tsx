import { cn } from "@/lib/utils";

type DecisionOverlayProps = {
  choices: readonly [string, string];
  onChoose?: (index: number) => void;
  className?: string;
};

export function DecisionOverlay({
  choices,
  onChoose,
  className,
}: DecisionOverlayProps) {
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
          <span className="mb-1 block text-[10px] font-bold tracking-[0.18em] text-white/48">
            {index === 0 ? "A" : "B"}
          </span>
          {choice}
        </button>
      ))}
    </fieldset>
  );
}
