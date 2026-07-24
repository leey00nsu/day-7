import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "랭킹",
  alternates: {
    canonical: "/ranking",
  },
};

export default function RankingPage() {
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
              RANKING
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
              랭킹
            </h1>
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

        <p className="my-auto py-16 text-center text-lg font-medium tracking-[-0.01em] text-white/68 sm:text-xl">
          추후 업데이트 예정입니다.
        </p>
      </div>
    </main>
  );
}
