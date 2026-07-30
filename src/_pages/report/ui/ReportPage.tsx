import Link from "next/link";

import { ReportDashboard } from "@/features/game-reporting";
import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/button";
import { GameVideo } from "@/widgets/game-video";

export function ReportPage() {
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
              REPORT
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
              리포트
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

        <ReportDashboard />

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
    </main>
  );
}
