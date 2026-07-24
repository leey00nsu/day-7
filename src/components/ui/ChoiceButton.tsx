import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

interface ChoiceButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  index: string;
  children: ReactNode;
  selected?: boolean;
}

export function ChoiceButton({
  index,
  children,
  selected = false,
  className,
  ...props
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "group flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint",
        selected
          ? "border-mint/70 bg-mint/15 text-white"
          : "border-white/12 bg-white/[.07] text-white/82 hover:border-white/25 hover:bg-white/12",
        className,
      )}
      aria-pressed={selected}
      {...props}
    >
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs",
          selected
            ? "border-mint bg-mint text-ink"
            : "border-white/18 bg-black/15 text-white/55",
        )}
        aria-hidden="true"
      >
        {index}
      </span>
      <span>{children}</span>
    </button>
  );
}
