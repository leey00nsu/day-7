import type { Metadata } from "next";
import Link from "next/link";

import {
  Pill,
  PillIndicator,
  PillStatus,
} from "@/components/kibo-ui/pill";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "기록과 설정",
};

export default function LibraryPage() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,#24342c,#0b0f0d_58%)] px-5 py-8 text-white sm:px-10 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-mint">
              GAME LIBRARY
            </p>
            <h1 className="mt-2 text-3xl font-bold">기록과 설정</h1>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 rounded-full bg-background/35 px-5 backdrop-blur-xl",
            )}
            href="/"
          >
            홈으로
          </Link>
        </header>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <GlassCard className="p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-white/45">
              SAVE / LOAD
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">진행 기록</h2>
              <Pill>
                <PillStatus>
                  <PillIndicator pulse />
                  자동 저장
                </PillStatus>
                SLOT 01
              </Pill>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="min-h-36 rounded-2xl border border-mint/35 bg-mint/10 p-4 text-left focus-visible:outline-2 focus-visible:outline-mint"
                type="button"
              >
                <span className="font-mono text-xs text-mint">SLOT 01</span>
                <strong className="mt-8 block">월요일 · 선택 전</strong>
                <small className="mt-1 block text-white/48">자동 저장</small>
              </button>
              <button
                className="min-h-36 rounded-2xl border border-dashed border-white/18 bg-white/[.04] p-4 text-left text-white/45 focus-visible:outline-2 focus-visible:outline-mint"
                type="button"
              >
                <span className="font-mono text-xs">SLOT 02</span>
                <strong className="mt-8 block">빈 슬롯</strong>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-white/45">
              SETTINGS
            </p>
            <h2 className="mt-2 text-xl font-bold">재생 설정</h2>
            <form className="mt-6 space-y-6">
              <label className="block">
                <span className="flex justify-between text-sm font-semibold">
                  음성 볼륨 <output>72%</output>
                </span>
                <input
                  className="mt-3 w-full accent-mint"
                  type="range"
                  defaultValue="72"
                  aria-label="음성 볼륨"
                />
              </label>
              <label className="flex min-h-12 items-center justify-between gap-4">
                <span>
                  <strong className="block text-sm">자막 표시</strong>
                  <small className="text-white/45">영상 위 HTML 자막</small>
                </span>
                <input
                  className="size-5 accent-mint"
                  type="checkbox"
                  defaultChecked
                />
              </label>
              <label className="flex min-h-12 items-center justify-between gap-4">
                <span>
                  <strong className="block text-sm">움직임 줄이기</strong>
                  <small className="text-white/45">배경 전환 최소화</small>
                </span>
                <input className="size-5 accent-mint" type="checkbox" />
              </label>
              <Button className="h-11 w-full rounded-xl" type="submit">
                설정 저장
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
