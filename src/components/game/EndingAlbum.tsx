"use client";

import { Check, Lock, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { buttonVariants } from "@/components/ui/button";
import { endings, type EndingId } from "@/data/game";
import {
  getEndingProgressSnapshot,
  parseUnlockedEndingIds,
  subscribeToEndingProgress,
} from "@/lib/ending-progress";
import { cn } from "@/lib/utils";

type EndingAlbumProps = {
  initialUnlockedIds?: readonly EndingId[];
};

export function EndingAlbum({ initialUnlockedIds }: EndingAlbumProps) {
  const storedProgress = useSyncExternalStore(
    subscribeToEndingProgress,
    getEndingProgressSnapshot,
    () => "[]",
  );
  const [selectedEndingId, setSelectedEndingId] = useState<EndingId | null>(
    null,
  );
  const unlockedIds = useMemo(
    () => initialUnlockedIds ?? parseUnlockedEndingIds(storedProgress),
    [initialUnlockedIds, storedProgress],
  );

  useEffect(() => {
    if (!selectedEndingId) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedEndingId(null);
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedEndingId]);

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds]);
  const selectedEnding = endings.find(
    (ending) => ending.id === selectedEndingId,
  );

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-black text-white">
      <video
        aria-hidden="true"
        autoPlay
        className="fixed inset-[-4%] -z-30 size-[108%] scale-105 object-cover blur-2xl"
        loop
        muted
        playsInline
        poster="/assets/home/home-hero-poster-16x9.png"
        preload="metadata"
      >
        <source src="/api/videos/t00_title_s01.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 -z-20 bg-black/68" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.1),transparent_48%),linear-gradient(180deg,rgba(0,0,0,.14),rgba(0,0,0,.54))]" />

      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-5 py-7 sm:px-10 sm:py-10">
        <header className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-white/48">
              ENDING ALBUM
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
              지금까지의 결말
            </h1>
            <p className="mt-3 text-sm text-white/58 sm:text-base">
              달성한 엔딩만 다시 볼 수 있습니다.
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "bg-black/30",
            )}
            href="/"
          >
            홈으로
          </Link>
        </header>

        <div className="mt-8 flex items-center gap-3 text-sm text-white/60">
          <span className="font-semibold text-white">
            {unlockedIds.length} / {endings.length}
          </span>
          <div className="h-px flex-1 bg-white/15">
            <div
              className="h-px bg-white transition-[width] duration-700"
              style={{
                width: `${(unlockedIds.length / endings.length) * 100}%`,
              }}
            />
          </div>
          <span>해금</span>
        </div>

        <section
          aria-label="엔딩 목록"
          className="my-auto grid gap-5 py-10 lg:grid-cols-3"
        >
          {endings.map((ending) => {
            const unlocked = unlockedSet.has(ending.id);

            return (
              <button
                aria-label={
                  unlocked
                    ? `${ending.title} 엔딩 보기`
                    : `${ending.id} 잠긴 엔딩`
                }
                className={cn(
                  "album-ending-card-reveal group relative overflow-hidden rounded-3xl border text-left shadow-2xl backdrop-blur-xl transition duration-300",
                  unlocked
                    ? "border-white/18 bg-black/34 hover:-translate-y-1 hover:border-white/38 hover:bg-black/42"
                    : "cursor-not-allowed border-white/8 bg-black/46",
                )}
                disabled={!unlocked}
                key={ending.id}
                onClick={() => setSelectedEndingId(ending.id)}
                type="button"
              >
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
              </button>
            );
          })}
        </section>
      </div>

      {selectedEnding ? (
        <div
          aria-labelledby="ending-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-5 backdrop-blur-md"
          onClick={() => setSelectedEndingId(null)}
          role="dialog"
        >
          <article
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/18 bg-[#111]/95 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="엔딩 상세 닫기"
              className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-lg transition hover:scale-105 hover:bg-black/70 active:scale-95"
              onClick={() => setSelectedEndingId(null)}
              type="button"
            >
              <X className="size-5" />
            </button>
            <div className="relative aspect-video bg-black">
              <Image
                alt={`${selectedEnding.title} 엔딩 키아트`}
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                src={selectedEnding.image}
              />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.18em] text-white/42">
                {selectedEnding.id} · UNLOCKED
              </p>
              <h2
                className="mt-2 text-2xl font-bold sm:text-3xl"
                id="ending-detail-title"
              >
                {selectedEnding.title}
              </h2>
              <p className="mt-4 leading-7 text-white/65">
                {selectedEnding.summary}
              </p>
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
