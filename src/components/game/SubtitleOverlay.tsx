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
      <p className="max-w-[min(92vw,1250px)] text-center text-[clamp(26px,2.7vw,36px)] font-semibold leading-[1.45] text-white [text-shadow:0_3px_4px_#000,0_0_10px_#000,0_0_18px_#000]">
        {line.speaker ? `${line.speaker} : ` : ""}
        {line.text}
      </p>
    </div>
  );
}
