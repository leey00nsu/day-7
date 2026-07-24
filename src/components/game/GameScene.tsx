"use client";

import { Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { DecisionOverlay } from "@/components/game/DecisionOverlay";
import { SubtitleOverlay } from "@/components/game/SubtitleOverlay";
import { Button } from "@/components/ui/button";
import {
  storyChapters,
  type StoryClip,
  type SubtitleCue,
} from "@/data/game";

type PlaybackMode = "main" | "decision" | "branch" | "complete";

function findCue(cues: readonly SubtitleCue[] | undefined, time: number) {
  return cues?.find((cue) => time >= cue.start && time < cue.end);
}

export function GameScene() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [clipIndex, setClipIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [mode, setMode] = useState<PlaybackMode>("main");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [captionsEnabled, setCaptionsEnabled] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.localStorage.getItem("game-captions") !== "false",
  );
  const [volume, setVolume] = useState(() =>
    typeof window === "undefined"
      ? 0.8
      : Number(window.localStorage.getItem("game-volume") ?? 80) / 100,
  );

  const chapter = storyChapters[chapterIndex];

  useEffect(() => {
    function updateCaptions(event: Event) {
      setCaptionsEnabled((event as CustomEvent<boolean>).detail);
    }

    function updateVolume(event: Event) {
      setVolume((event as CustomEvent<number>).detail / 100);
    }

    window.addEventListener("game:captions", updateCaptions);
    window.addEventListener("game:volume", updateVolume);

    return () => {
      window.removeEventListener("game:captions", updateCaptions);
      window.removeEventListener("game:volume", updateVolume);
    };
  }, []);

  const activeClip = useMemo<StoryClip | undefined>(() => {
    if (mode === "main") {
      return chapter.clips[clipIndex];
    }

    if (mode === "branch" && selectedChoice !== null) {
      return chapter.choices[selectedChoice].clips[clipIndex];
    }

    return undefined;
  }, [chapter, clipIndex, mode, selectedChoice]);

  const activeCue = captionsEnabled
    ? findCue(activeClip?.cues, currentTime)
    : undefined;

  const videoFilename =
    mode === "decision" ? "select_decision.mp4" : activeClip?.filename;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [videoFilename, volume]);

  function advanceChapter() {
    if (chapterIndex < storyChapters.length - 1) {
      setChapterIndex((value) => value + 1);
      setClipIndex(0);
      setSelectedChoice(null);
      setMode("main");
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }

    setMode("complete");
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function handleEnded() {
    if (mode === "main") {
      if (clipIndex < chapter.clips.length - 1) {
        setClipIndex((value) => value + 1);
      } else {
        setClipIndex(0);
        setMode("decision");
      }
    } else if (mode === "branch" && selectedChoice !== null) {
      const branchClips = chapter.choices[selectedChoice].clips;

      if (clipIndex < branchClips.length - 1) {
        setClipIndex((value) => value + 1);
      } else {
        advanceChapter();
      }
    }

    setCurrentTime(0);
    setIsPlaying(true);
  }

  function choose(index: number) {
    const branchClips = chapter.choices[index].clips;
    setSelectedChoice(index);
    setCurrentTime(0);
    setClipIndex(0);

    if (branchClips.length === 0) {
      advanceChapter();
      return;
    }

    setMode("branch");
  }

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-black text-white">
      {videoFilename ? (
        <video
          autoPlay
          className="absolute inset-0 size-full object-cover"
          key={videoFilename}
          loop={mode === "decision"}
          onEnded={handleEnded}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          playsInline
          preload="auto"
          ref={videoRef}
        >
          <source
            src={`/api/videos/${encodeURIComponent(videoFilename)}`}
            type="video/mp4"
          />
        </video>
      ) : (
        <div className="absolute inset-0 bg-black" aria-label="영상 없음" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.46),transparent_24%,transparent_68%,rgba(0,0,0,.5))]" />

      <header className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <Link
          className="block text-[11px] font-semibold tracking-[0.16em] text-white/55 transition hover:text-white"
          href="/"
        >
          정규직까지 D-7
        </Link>
        <p className="mt-1 text-sm font-semibold text-white/88">
          {chapter.day} · {chapter.title}
        </p>
      </header>

      {mode === "decision" ? (
        <DecisionOverlay
          choices={[
            chapter.choices[0].label,
            chapter.choices[1].label,
          ]}
          onChoose={choose}
        />
      ) : null}

      <SubtitleOverlay
        line={
          activeCue
            ? { speaker: activeCue.speaker, text: activeCue.text }
            : undefined
        }
      />

      {mode !== "decision" && mode !== "complete" ? (
        <Button
          aria-label={isPlaying ? "일시정지" : "재생"}
          className="absolute bottom-4 left-4 z-50 size-10 rounded-full border border-white/15 bg-black/35 text-white backdrop-blur-xl hover:bg-black/55 sm:bottom-6 sm:left-6"
          onClick={togglePlayback}
          size="icon"
          variant="ghost"
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>
      ) : null}

      {mode === "complete" ? (
        <section className="absolute inset-0 z-30 grid place-items-center bg-black px-5 text-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-white/45">
              AVAILABLE FOOTAGE COMPLETE
            </p>
            <h1 className="mt-3 text-2xl font-bold">
              현재 준비된 장면을 모두 재생했습니다.
            </h1>
            <Link
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full border border-white/18 bg-white px-6 text-sm font-semibold text-black"
              href="/"
            >
              홈으로
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
