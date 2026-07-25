import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DecisionOverlayProps = {
  choices: readonly [string, string];
  prompt: string;
  onChoose?: (index: number) => void;
  className?: string;
};

export function DecisionOverlay({
  choices,
  prompt,
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
      <legend className="sr-only">{prompt}</legend>
      <div
        aria-hidden="true"
        className="decision-question-vignette pointer-events-none absolute inset-x-0 top-[8%] h-[19%]"
      />
      <p
        aria-hidden="true"
        className="decision-prompt-reveal pointer-events-none absolute left-1/2 top-[13%] w-[min(82vw,880px)] -translate-x-1/2 text-center text-xl font-semibold leading-snug tracking-[-0.02em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)] sm:text-2xl lg:text-4xl"
        data-testid="decision-prompt"
      >
        {prompt}
      </p>
      <Image
        alt=""
        aria-hidden="true"
        className="decision-divider-reveal pointer-events-none absolute left-1/2 top-[19%] w-[min(72vw,760px)] -translate-x-1/2 opacity-90"
        height={120}
        src="/assets/ui/diamond-divider-white-thin-gap.svg"
        width={1600}
      />
      {choices.map((choice, index) => (
        <button
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "decision-choice-reveal absolute top-1/2 h-auto min-h-[4.5rem] w-[min(38vw,420px)] -translate-y-1/2 px-7 py-5 text-center text-base leading-7 shadow-2xl shadow-black/40 hover:-translate-y-[calc(50%+2px)] focus-visible:ring-white max-md:portrait:static max-md:portrait:min-w-0 max-md:portrait:flex-1 max-md:portrait:translate-y-0 max-md:portrait:px-4 max-md:portrait:py-4 max-md:portrait:text-sm max-md:portrait:hover:translate-y-0 sm:px-9 sm:py-6 sm:text-lg",
            index === 0
              ? "left-[10vw]"
              : "right-[10vw]",
          )}
          key={choice}
          onClick={() => onChoose?.(index)}
          style={{ animationDelay: index === 0 ? "0.55s" : "0.78s" }}
          type="button"
        >
          {choice}
        </button>
      ))}
    </fieldset>
  );
}
