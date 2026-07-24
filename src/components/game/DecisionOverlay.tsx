import { buttonVariants } from "@/components/ui/button";
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
            buttonVariants({ variant: "outline", size: "lg" }),
            "absolute top-1/2 h-auto min-h-14 w-[min(34vw,360px)] -translate-y-1/2 px-5 py-4 text-center text-sm leading-6 shadow-2xl shadow-black/30 hover:-translate-y-[calc(50%+2px)] focus-visible:ring-white sm:px-7 sm:py-5 sm:text-base",
            index === 0 ? "left-[4vw]" : "right-[4vw]",
          )}
          key={choice}
          onClick={() => onChoose?.(index)}
          type="button"
        >
          {choice}
        </button>
      ))}
    </fieldset>
  );
}
