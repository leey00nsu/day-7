"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  Choicebox,
  ChoiceboxIndicator,
  ChoiceboxItem,
  ChoiceboxItemHeader,
  ChoiceboxItemSubtitle,
  ChoiceboxItemTitle,
} from "@/components/kibo-ui/choicebox";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/kibo-ui/status";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { Button } from "@/components/ui/button";
import { weeklyChoices } from "@/data/game";

export function GameScene() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const scene = weeklyChoices[sceneIndex];

  function choose(index: number) {
    setSelected(index);
  }

  function continueStory() {
    if (selected === null) return;
    if (sceneIndex < weeklyChoices.length - 1) {
      setSceneIndex((value) => value + 1);
      setSelected(null);
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-ink">
      <Image
        className="object-cover"
        src="/assets/story/open-office-set.png"
        alt="좋은상사의 현실적인 오픈 오피스"
        fill
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,8,.72),transparent_34%,rgba(5,10,8,.2)_50%,rgba(5,10,8,.92))]" />

      <div className="relative mx-auto flex min-h-svh w-full max-w-[1440px] flex-col px-4 py-4 sm:px-8 sm:py-6">
        <header className="flex items-start justify-between gap-5">
          <div>
            <Link
              className="text-xs font-semibold tracking-[0.16em] text-white/55 hover:text-white"
              href="/"
            >
              ← GOOD COMPANY
            </Link>
            <h1 className="mt-2 text-xl font-bold">정규직 D-7</h1>
          </div>
          <GlassCard className="w-[min(48vw,320px)] px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
                {scene.day} · {scene.title}
              </p>
              <Status status="online" className="shrink-0">
                <StatusIndicator />
                <StatusLabel>재생 중</StatusLabel>
              </Status>
            </div>
            <ProgressSteps current={sceneIndex + 1} total={7} />
          </GlassCard>
        </header>

        <div className="mt-auto grid gap-3 pb-3 sm:pb-5 lg:grid-cols-[1fr_440px] lg:items-end">
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.13em] text-mint">
                  {sceneIndex === 2 ? "부장" : "대리"}
                </p>
                <h2 className="mt-1 text-xl font-bold">{scene.speaker}</h2>
              </div>
              <span className="rounded-full border border-white/12 bg-white/[.06] px-3 py-1.5 font-mono text-xs text-white/55">
                00:08
              </span>
            </div>
            <p className="mt-5 text-pretty text-lg leading-8 text-white/88 sm:text-xl">
              “{scene.dialogue}”
            </p>
          </GlassCard>

          <GlassCard className="p-3 sm:p-4">
            <fieldset>
              <legend className="px-1 pb-3 text-xs font-semibold tracking-[0.12em] text-white/48">
                선택
              </legend>
              <Choicebox
                className="grid gap-2"
                value={selected === null ? undefined : String(selected)}
                onValueChange={(value) => choose(Number(value))}
              >
                {scene.choices.map((choice, index) => (
                  <ChoiceboxItem
                    key={choice}
                    id={`choice-${sceneIndex}-${index}`}
                    value={String(index)}
                  >
                    <ChoiceboxIndicator id={`choice-${sceneIndex}-${index}`} />
                    <ChoiceboxItemHeader>
                      <ChoiceboxItemTitle>{choice}</ChoiceboxItemTitle>
                      <ChoiceboxItemSubtitle>
                        선택 {String.fromCharCode(65 + index)}
                      </ChoiceboxItemSubtitle>
                    </ChoiceboxItemHeader>
                  </ChoiceboxItem>
                ))}
              </Choicebox>
              <Button
                className="mt-3 h-12 w-full rounded-2xl text-sm font-bold"
                size="lg"
                disabled={selected === null}
                onClick={continueStory}
              >
                {sceneIndex === weeklyChoices.length - 1
                  ? "선택 기록 완료"
                  : "다음 장면"}
              </Button>
            </fieldset>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
