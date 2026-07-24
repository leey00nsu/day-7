import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "랭킹",
};

export default function RankingPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(circle_at_center,#232725,#090a09_72%)] px-5 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/12 bg-white/[.06] p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-white/45">
          RANKING
        </p>
        <h1 className="mt-3 text-3xl font-bold">랭킹</h1>
        <p className="mt-4 leading-7 text-white/60">
          플레이 기록이 쌓이면 이곳에서 다른 선택 경향과 비교할 수 있습니다.
        </p>
        <Link
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-7 h-11 rounded-full border-white/16 bg-white/[.06] px-6 text-white",
          )}
          href="/"
        >
          홈으로
        </Link>
      </section>
    </main>
  );
}
