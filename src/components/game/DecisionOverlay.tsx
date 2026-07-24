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
      aria-label="행동 선택"
      className={cn(
        "absolute inset-0 z-30 max-md:portrait:flex max-md:portrait:items-end max-md:portrait:justify-center max-md:portrait:gap-3 max-md:portrait:px-4 max-md:portrait:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <legend className="sr-only">다음 행동을 선택하세요</legend>
      {choices.map((choice, index) => (
        <button
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "absolute top-1/2 h-auto min-h-14 w-[min(34vw,360px)] -translate-y-1/2 px-5 py-4 text-center text-sm leading-6 shadow-2xl shadow-black/30 hover:-translate-y-[calc(50%+2px)] focus-visible:ring-white max-md:portrait:static max-md:portrait:min-w-0 max-md:portrait:flex-1 max-md:portrait:translate-y-0 max-md:portrait:px-3 max-md:portrait:py-3 max-md:portrait:hover:translate-y-0 sm:px-7 sm:py-5 sm:text-base",
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
