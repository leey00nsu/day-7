import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const menuItems = [
  { label: "시작하기", href: "/story", primary: true },
  { label: "랭킹", href: "/ranking", primary: false },
  { label: "앨범", href: "/endings", primary: false },
] as const;

export default function Home() {
  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-black text-white">
      <video
        aria-label="정규직 D-7 타이틀 배경"
        autoPlay
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        playsInline
        poster="/assets/home/home-hero-poster-16x9.png"
        preload="auto"
      >
        <source src="/videos/t00_title_s01.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_5%,rgba(0,0,0,.16)_58%,rgba(0,0,0,.52)),linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.08)_55%,rgba(0,0,0,.5))]" />

      <section className="relative flex min-h-svh flex-col items-center justify-center px-5 py-20 text-center">
        <h1 className="sr-only">정규직까지 D-7</h1>
        <Image
          alt=""
          className="home-logo-reveal h-auto w-[min(52vw,350px)] drop-shadow-[0_10px_35px_rgba(0,0,0,.52)]"
          height={867}
          priority
          src="/assets/brand/game-title-logo.png"
          width={1029}
        />

        <nav
          aria-label="메인 메뉴"
          className="mt-12 grid w-[min(94vw,700px)] grid-cols-3 gap-4 sm:mt-16 sm:gap-7"
        >
          {menuItems.map((item) => (
            <Link
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
                "home-menu-item-reveal h-12 px-3 text-[14px] font-semibold sm:h-13 sm:px-6 sm:text-[15px]",
                item.primary
                  ? "border-white"
                  : "bg-gray-800/30",
              )}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
