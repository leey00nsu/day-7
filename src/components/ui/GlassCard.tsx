import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "./cn";

export const GlassCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function GlassCard({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[24px] border border-white/15 bg-panel/72 shadow-2xl shadow-black/20 backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
});
