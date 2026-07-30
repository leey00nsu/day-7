import { CircleHelp } from "lucide-react";

import { cn } from "@/shared/lib/cn";

export type ChoiceFeedbackProps = {
  message: string;
  exiting?: boolean;
  className?: string;
};

export function ChoiceFeedback({
  message,
  exiting = false,
  className,
}: ChoiceFeedbackProps) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed left-1/2 top-[clamp(1.5rem,5vh,3.5rem)] z-[110] w-max max-w-[min(90vw,760px)] -translate-x-1/2",
        className,
      )}
      role="status"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-md bg-black/58 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-black/45 backdrop-blur-lg sm:px-5 sm:text-base",
          exiting
            ? "opacity-0 transition-opacity duration-500 ease-out"
            : "animate-in fade-in slide-in-from-bottom-3 duration-500",
        )}
      >
        <CircleHelp
          aria-hidden="true"
          className="size-5 shrink-0 fill-white text-black"
        />
        <span className="[text-shadow:0_2px_5px_#000]">{message}</span>
      </div>
    </div>
  );
}
