import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const GlassCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function GlassCard({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-border bg-card/78 text-card-foreground shadow-2xl shadow-black/20 backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
});
