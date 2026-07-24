import { cn } from "@/lib/utils";

export type SubtitleLine = {
  speaker?: string;
  text: string;
};

type SubtitleOverlayProps = {
  line?: SubtitleLine;
  className?: string;
};

export function SubtitleOverlay({
  line,
  className,
}: SubtitleOverlayProps) {
  if (!line) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute inset-x-4 bottom-[clamp(2.5rem,8vh,6.5rem)] z-40 flex justify-center",
        className,
      )}
    >
      <p className="max-w-[min(90vw,980px)] text-center text-[clamp(17px,1.8vw,24px)] font-semibold leading-relaxed text-white [text-shadow:0_2px_3px_#000,0_0_8px_#000,0_0_14px_#000]">
        {line.speaker ? `${line.speaker} : ` : ""}
        {line.text}
      </p>
    </div>
  );
}
