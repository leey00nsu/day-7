"use client";

import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  EndingCard,
  endings,
  getEndingProgressSnapshot,
  getLastEndingSnapshot,
  parseLastEndingId,
  parseUnlockedEndingIds,
  subscribeToEndingProgress,
  type EndingId,
} from "@/entities/game";
import { GameVideo } from "@/widgets/game-video";
import {
  useReportData,
  type ReportData,
} from "@/features/game-reporting";
import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/button";

type EndingAlbumProps = {
  initialUnlockedIds?: readonly EndingId[];
  initialReportData?: ReportData;
};

export function EndingAlbum({
  initialUnlockedIds,
  initialReportData,
}: EndingAlbumProps) {
  const storedProgress = useSyncExternalStore(
    subscribeToEndingProgress,
    getEndingProgressSnapshot,
    () => "[]",
  );
  const lastEndingSnapshot = useSyncExternalStore(
    subscribeToEndingProgress,
    getLastEndingSnapshot,
    () => "",
  );
  const [selectedEndingId, setSelectedEndingId] = useState<EndingId | null>(
    null,
  );
  const { data: reportData } = useReportData(initialReportData);
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
  const lastEndingId = parseLastEndingId(lastEndingSnapshot);
  const selectedEnding = endings.find(
    (ending) => ending.id === selectedEndingId,
  );

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-black text-white">
      <GameVideo
        aria-hidden="true"
        autoPlay
        className="fixed inset-[-4%] -z-30 size-[108%] scale-105 object-cover blur-2xl"
        filename="t00_title_s01.mp4"
        loop
        muted
        playsInline
        poster="/assets/home/home-hero-poster-16x9.png"
        preload="metadata"
      />
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
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "hidden bg-black/30 sm:inline-flex",
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
              <EndingCard
                ending={ending}
                isLatestEnding={lastEndingId === ending.id}
                key={ending.id}
                onSelect={() => setSelectedEndingId(ending.id)}
                reachCount={reportData?.endings[ending.id]}
                unlocked={unlocked}
              />
            );
          })}
        </section>

        <Link
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mb-[max(0rem,env(safe-area-inset-bottom))] mt-2 w-full bg-black/30 sm:hidden",
          )}
          href="/"
        >
          홈으로
        </Link>
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
              {reportData ? (
                <p className="mt-5 text-sm font-medium text-[#f87171]">
                  {lastEndingId === selectedEnding.id
                    ? `나와 ${reportData.endings[
                        selectedEnding.id
                      ].toLocaleString()}명의 사람들이 이 엔딩에 도달했습니다.`
                    : `${reportData.endings[
                        selectedEnding.id
                      ].toLocaleString()}명의 사람들이 이 엔딩에 도달했습니다.`}
                </p>
              ) : null}
            </div>
          </article>
        </div>
      ) : null}
    </main>
  );
}
