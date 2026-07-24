import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface ProgressStepsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  current: number;
  total: number;
  label?: string;
}

export function ProgressSteps({
  current,
  total,
  label,
  className,
  ...props
}: ProgressStepsProps) {
  const safeTotal = Math.max(1, Math.floor(total));
  const safeCurrent = Math.min(safeTotal, Math.max(1, Math.floor(current)));

  return (
    <div
      className={cn("flex min-w-32 items-center gap-3", className)}
      role="progressbar"
      aria-label={label ?? `진행 단계 ${safeTotal}개 중 ${safeCurrent}번째`}
      aria-valuemin={1}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCurrent}
      {...props}
    >
      <ol className="flex flex-1 gap-1.5" aria-hidden="true">
        {Array.from({ length: safeTotal }, (_, index) => (
          <li
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full",
              index < safeCurrent ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </ol>
      <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">
        {safeCurrent}/{safeTotal}
      </span>
    </div>
  );
}
