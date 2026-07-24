import { Check, Lock } from "lucide-react";
import Image from "next/image";

import type { Ending } from "@/data/game";
import { cn } from "@/lib/utils";

type EndingCardProps = {
  ending: Ending;
  unlocked: boolean;
  className?: string;
  onSelect?: () => void;
};

export function EndingCard({
  ending,
  unlocked,
  className,
  onSelect,
}: EndingCardProps) {
  const cardClassName = cn(
    "album-ending-card-reveal group relative overflow-hidden rounded-3xl border text-left shadow-2xl backdrop-blur-xl transition duration-300",
    unlocked
      ? "border-white/18 bg-black/34"
      : "border-white/8 bg-black/46",
    onSelect && unlocked
      ? "hover:-translate-y-1 hover:border-white/38 hover:bg-black/42"
      : "",
    className,
  );

  const content = (
    <>
      <div className="relative aspect-video overflow-hidden bg-black/65">
        {unlocked ? (
          <Image
            alt={`${ending.title} 엔딩 키아트`}
            className="object-cover transition duration-700 group-hover:scale-[1.025]"
            fill
            loading="eager"
            sizes="(max-width: 1024px) 100vw, 33vw"
            src={ending.image}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,.04),transparent_50%),radial-gradient(circle_at_center,rgba(255,255,255,.06),transparent_48%)]">
            <Lock
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-white/32"
              strokeWidth={1.4}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/52 via-transparent to-transparent" />
        <span
          className={cn(
            "absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md",
            unlocked
              ? "bg-white/88 text-black"
              : "bg-black/45 text-white/45",
          )}
        >
          {unlocked ? (
            <Check aria-hidden="true" className="size-3.5" />
          ) : (
            <Lock aria-hidden="true" className="size-3.5" />
          )}
          {unlocked ? "해금됨" : "잠김"}
        </span>
      </div>

      <div className="min-h-40 p-5 sm:p-6">
        <p className="font-mono text-xs font-bold tracking-[0.14em] text-white/40">
          {ending.id}
        </p>
        <h2
          className={cn(
            "mt-2 text-xl font-bold",
            unlocked ? "text-white" : "text-white/36",
          )}
        >
          {unlocked ? ending.title : "잠긴 엔딩"}
        </h2>
        <p
          className={cn(
            "mt-3 text-sm leading-6",
            unlocked ? "text-white/62" : "text-white/30",
          )}
        >
          {unlocked
            ? ending.summary
            : "게임에서 이 결말에 도달하면 내용이 공개됩니다."}
        </p>
      </div>
    </>
  );

  if (!onSelect) {
    return <article className={cardClassName}>{content}</article>;
  }

  return (
    <button
      aria-label={
        unlocked ? `${ending.title} 엔딩 보기` : `${ending.id} 잠긴 엔딩`
      }
      className={cn(cardClassName, !unlocked && "cursor-not-allowed")}
      disabled={!unlocked}
      onClick={onSelect}
      type="button"
    >
      {content}
    </button>
  );
}
