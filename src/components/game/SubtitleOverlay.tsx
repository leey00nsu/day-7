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
      <p className="max-w-[min(88vw,920px)] rounded-xl bg-black/68 px-4 py-2.5 text-center text-[clamp(15px,1.7vw,22px)] font-semibold leading-relaxed text-white shadow-xl shadow-black/30 backdrop-blur-md [text-shadow:0_2px_8px_rgb(0_0_0/.9)] sm:px-6 sm:py-3">
        {line.speaker ? (
          <span className="mr-2 text-white/62">{line.speaker}</span>
        ) : null}
        {line.text}
      </p>
    </div>
  );
}
