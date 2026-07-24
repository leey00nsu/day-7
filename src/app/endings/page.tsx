import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Pill } from "@/components/kibo-ui/pill";
import { buttonVariants } from "@/components/ui/button";
import { endings } from "@/data/game";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "엔딩",
};

export default function EndingsPage() {
  return (
    <main className="min-h-svh bg-[#f2f3f2] px-5 py-8 text-ink sm:px-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-ink/65">
              ENDING ARCHIVE
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
              금요일의 세 가지 결말
            </h1>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-black/25 bg-black/55",
            )}
            href="/"
          >
            홈으로
          </Link>
        </header>

        <section className="mt-9 grid gap-5 lg:grid-cols-3">
          {endings.map((ending) => (
            <article
              key={ending.id}
              className="overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-xl shadow-black/5"
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                <Image
                  className="object-cover transition duration-500 hover:scale-[1.02]"
                  src={ending.image}
                  alt={`${ending.title} 엔딩 키아트`}
                  fill
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 sm:p-6">
                <Pill
                  variant="outline"
                  className="border-black/10 bg-black/[.03] font-mono text-xs font-bold text-ink/70"
                >
                  {ending.id}
                </Pill>
                <h2 className="mt-2 text-xl font-bold">{ending.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/62">
                  {ending.summary}
                </p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
