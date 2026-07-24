import Image from "next/image";
import Link from "next/link";

import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-ink text-white">
      <picture className="absolute inset-0 block">
        <source
          media="(max-width: 640px)"
          srcSet="/assets/home/home-hero-poster-9x16.png"
        />
        <Image
          className="object-cover"
          src="/assets/home/home-hero-poster-16x9.png"
          alt="늦은 오후 좋은상사 오픈 오피스에 홀로 선 김인턴"
          fill
          priority
          sizes="100vw"
        />
      </picture>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,8,.82),rgba(5,10,8,.28)_58%,rgba(5,10,8,.58)),linear-gradient(0deg,rgba(5,10,8,.88),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1440px] flex-col justify-between px-5 py-5 sm:px-10 sm:py-8">
        <header className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.18em] text-white/60">
            GOOD COMPANY · INTERACTIVE DRAMA
          </span>
          <Link
            className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-white/75 backdrop-blur-xl transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint"
            href="/library"
          >
            기록과 설정
          </Link>
        </header>

        <section className="flex max-w-xl flex-col items-start gap-7 pb-[8vh]">
          <Image
            className="h-auto w-[min(78vw,380px)]"
            src="/assets/brand/game-title-logo.png"
            alt="정규직까지 D-7"
            width={1024}
            height={512}
            priority
          />
          <p className="max-w-md text-pretty text-base leading-7 text-white/72 sm:text-lg">
            결과 발표까지 일주일. 네 번의 선택을 지나 금요일이 되면,
            회사가 내린 결론과 김인턴의 선택이 함께 드러납니다.
          </p>

          <GlassCard className="w-full p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <Announcement themed className="border-primary/20 bg-primary/8">
                <AnnouncementTag>DAY 1</AnnouncementTag>
                <AnnouncementTitle>월요일 · 아직 끝나지 않은 일</AnnouncementTitle>
              </Announcement>
              <ProgressSteps current={1} total={7} />
            </div>
          </GlassCard>

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Link
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-13 flex-1 rounded-2xl px-6 text-[15px] font-bold",
              )}
              href="/story"
            >
              시작하기
            </Link>
            <Link
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-13 flex-1 rounded-2xl bg-background/35 px-6 text-[15px] font-bold backdrop-blur-xl",
              )}
              href="/endings"
            >
              엔딩 미리보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
