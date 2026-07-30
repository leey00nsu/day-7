import { cn } from "@/shared/lib/cn";

export type SubtitleLine = {
  speaker?: string;
  text: string;
};

type SubtitleOverlayProps = {
  line?: SubtitleLine;
  scale?: number;
  className?: string;
};

export function SubtitleOverlay({
  line,
  scale = 1,
  className,
}: SubtitleOverlayProps) {
  if (!line) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute inset-x-4 bottom-[clamp(2.5rem,8vh,6.5rem)] z-40 flex justify-center max-md:portrait:bottom-[calc((100svh-56.25vw)/2-3rem)]",
        className,
      )}
    >
      <p
        className="max-w-[min(92vw,1250px)] text-center font-semibold leading-[1.45] text-white [text-shadow:0_3px_4px_#000,0_0_10px_#000,0_0_18px_#000]"
        style={{
          fontSize: `clamp(${26 * scale}px, ${2.7 * scale}vw, ${36 * scale}px)`,
        }}
      >
        {line.speaker ? `${line.speaker} : ` : ""}
        {line.text}
      </p>
    </div>
  );
}
