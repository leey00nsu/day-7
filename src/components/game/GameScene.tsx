"use client";

import { ChevronsRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DecisionOverlay } from "@/components/game/DecisionOverlay";
import { ChapterIntro } from "@/components/game/ChapterIntro";
import { ChoiceFeedback } from "@/components/game/ChoiceFeedback";
import {
  StoryMusic,
  type StoryMusicMode,
} from "@/components/game/StoryMusic";
import { SubtitleOverlay } from "@/components/game/SubtitleOverlay";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  storyChapters,
  type StoryClip,
  type SubtitleCue,
} from "@/data/game";

type PlaybackMode =
  | "chapterIntro"
  | "main"
  | "decision"
  | "branch"
  | "complete";
type VideoSlots = [string | undefined, string | undefined];

function findCue(cues: readonly SubtitleCue[] | undefined, time: number) {
  return cues?.find((cue) => time >= cue.start && time < cue.end);
}

export function GameScene() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [clipIndex, setClipIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [mode, setMode] = useState<PlaybackMode>("chapterIntro");
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [choiceFeedback, setChoiceFeedback] = useState<string | null>(null);
  const [choiceFeedbackExiting, setChoiceFeedbackExiting] = useState(false);
  const [chapterVideoPending, setChapterVideoPending] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [videoSlots, setVideoSlots] = useState<VideoSlots>([
    storyChapters[0].clips[0].filename,
    storyChapters[0].clips[1]?.filename,
  ]);
  const [captionsEnabled, setCaptionsEnabled] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.localStorage.getItem("game-captions") !== "false",
  );
  const [captionSize, setCaptionSize] = useState(() =>
    typeof window === "undefined"
      ? 100
      : Number(window.localStorage.getItem("game-caption-size") ?? 100),
  );
  const [volume, setVolume] = useState(() =>
    typeof window === "undefined"
      ? 0.8
      : Number(window.localStorage.getItem("game-volume") ?? 80) / 100,
  );
  const [effectsVolume, setEffectsVolume] = useState(() =>
    typeof window === "undefined"
      ? 0.4
      : Number(window.localStorage.getItem("game-effects-volume") ?? 40) / 100,
  );
  const [musicVolume, setMusicVolume] = useState(() =>
    typeof window === "undefined"
      ? 0.28
      : Number(window.localStorage.getItem("game-music-volume") ?? 28) / 100,
  );

  const chapter = storyChapters[chapterIndex];

  useEffect(() => {
    function updateCaptions(event: Event) {
      setCaptionsEnabled((event as CustomEvent<boolean>).detail);
    }

    function updateVolume(event: Event) {
      setVolume((event as CustomEvent<number>).detail / 100);
    }

    function updateCaptionSize(event: Event) {
      setCaptionSize((event as CustomEvent<number>).detail);
    }

    function updateEffectsVolume(event: Event) {
      setEffectsVolume((event as CustomEvent<number>).detail / 100);
    }

    function updateMusicVolume(event: Event) {
      setMusicVolume((event as CustomEvent<number>).detail / 100);
    }

    window.addEventListener("game:captions", updateCaptions);
    window.addEventListener("game:caption-size", updateCaptionSize);
    window.addEventListener("game:volume", updateVolume);
    window.addEventListener("game:effects-volume", updateEffectsVolume);
    window.addEventListener("game:music-volume", updateMusicVolume);

    return () => {
      window.removeEventListener("game:captions", updateCaptions);
      window.removeEventListener("game:caption-size", updateCaptionSize);
      window.removeEventListener("game:volume", updateVolume);
      window.removeEventListener("game:effects-volume", updateEffectsVolume);
      window.removeEventListener("game:music-volume", updateMusicVolume);
    };
  }, []);

  useEffect(() => {
    for (const video of videoRefs.current) {
      if (video) video.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!choiceFeedback) return;

    const exitTimer = window.setTimeout(() => {
      setChoiceFeedbackExiting(true);
    }, 3000);
    const removeTimer = window.setTimeout(() => {
      setChoiceFeedback(null);
    }, 3600);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [choiceFeedback]);

  const activeClip = useMemo<StoryClip | undefined>(() => {
    if (mode === "main") {
      return chapter.clips[clipIndex];
    }

    if (mode === "branch" && selectedChoice !== null && chapter.choices) {
      return chapter.choices[selectedChoice].clips[clipIndex];
    }

    return undefined;
  }, [chapter, clipIndex, mode, selectedChoice]);

  const activeCue = captionsEnabled
    ? findCue(activeClip?.cues, currentTime)
    : undefined;
  const decisionThought =
    captionsEnabled && mode === "decision" && chapter.decisionThought
      ? {
          speaker: "김인턴 (속마음)",
          text: chapter.decisionThought,
        }
      : undefined;

  const videoFilename =
    mode === "decision" ? "select_decision.mp4" : activeClip?.filename;

  const preloadFilename = useMemo(() => {
    if (mode === "main") {
      return (
        chapter.clips[clipIndex + 1]?.filename ??
        (chapter.choices
          ? "select_decision.mp4"
          : storyChapters[chapterIndex + 1]?.clips[0]?.filename)
      );
    }

    if (mode === "branch" && selectedChoice !== null && chapter.choices) {
      const branchClips = chapter.choices[selectedChoice].clips;

      return (
        branchClips[clipIndex + 1]?.filename ??
        storyChapters[chapterIndex + 1]?.clips[0]?.filename
      );
    }

    return undefined;
  }, [chapter, chapterIndex, clipIndex, mode, selectedChoice]);

  const activateSlot = useCallback(
    async (slot: number, filename: string) => {
      if (filename !== videoFilename) return;

      const nextVideo = videoRefs.current[slot];
      if (!nextVideo) return;

      if (slot === activeSlot && !nextVideo.paused) return;

      nextVideo.currentTime = 0;
      nextVideo.volume = volume;

      try {
        await nextVideo.play();
        if (slot !== activeSlot) {
          videoRefs.current[activeSlot]?.pause();
          if (preloadFilename) {
            setVideoSlots((slots) => {
              const next: VideoSlots = [...slots];
              next[activeSlot] = preloadFilename;
              return next;
            });
          }
          setActiveSlot(slot);
        }
        setCurrentTime(0);
        setIsPlaying(true);
        setChapterVideoPending(false);
      } catch {
        if (slot !== activeSlot) {
          videoRefs.current[activeSlot]?.pause();
          setActiveSlot(slot);
        }
        setIsPlaying(false);
        setChapterVideoPending(false);
      }
    },
    [activeSlot, preloadFilename, videoFilename, volume],
  );

  useEffect(() => {
    if (!videoFilename) return;

    if (videoSlots[activeSlot] === videoFilename) {
      const currentVideo = videoRefs.current[activeSlot];

      if (
        chapterVideoPending &&
        currentVideo &&
        currentVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        void activateSlot(activeSlot, videoFilename);
      }
      return;
    }

    const nextSlot = activeSlot === 0 ? 1 : 0;
    const waitingVideo = videoRefs.current[nextSlot];

    if (videoSlots[nextSlot] === videoFilename) {
      if (
        waitingVideo &&
        waitingVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        void activateSlot(nextSlot, videoFilename);
      }
      return;
    }

    const updateFrame = window.requestAnimationFrame(() => {
      setVideoSlots((slots) => {
        const next: VideoSlots = [...slots];
        next[nextSlot] = videoFilename;
        return next;
      });
    });

    return () => window.cancelAnimationFrame(updateFrame);
  }, [
    activateSlot,
    activeSlot,
    chapterVideoPending,
    videoFilename,
    videoSlots,
  ]);

  function advanceChapter() {
    if (chapterIndex < storyChapters.length - 1) {
      for (const video of videoRefs.current) {
        video?.pause();
      }
      setChapterIndex((value) => value + 1);
      setClipIndex(0);
      setSelectedChoice(null);
      setMode("chapterIntro");
      setCurrentTime(0);
      setIsPlaying(false);
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
      } else if (chapter.choices) {
        setClipIndex(0);
        setMode("decision");
      } else {
        advanceChapter();
      }
    } else if (
      mode === "branch" &&
      selectedChoice !== null &&
      chapter.choices
    ) {
      const branchClips = chapter.choices[selectedChoice].clips;

      if (clipIndex < branchClips.length - 1) {
        setClipIndex((value) => value + 1);
      } else {
        advanceChapter();
      }
    }

    setCurrentTime(0);
  }

  function choose(index: number) {
    if (!chapter.choices) return;

    const branchClips = chapter.choices[index].clips;
    setChoiceFeedbackExiting(false);
    setChoiceFeedback(chapter.choices[index].feedback);
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
    if (
      mode === "chapterIntro" ||
      mode === "decision" ||
      mode === "complete"
    ) {
      return;
    }

    const video = videoRefs.current[activeSlot];
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }

  function skipCurrentVideo() {
    if (mode !== "main" && mode !== "branch") return;

    videoRefs.current[activeSlot]?.pause();
    handleEnded();
  }

  function handleStageClick(event: MouseEvent<HTMLElement>) {
    if (mode === "decision") return;

    const target = event.target as HTMLElement;

    if (target.closest("a, button, input, label")) return;
    void togglePlayback();
  }

  const finishChapterIntro = useCallback(() => {
    setChapterVideoPending(true);
    setMode(chapter.clips.length > 0 ? "main" : "decision");
    setCurrentTime(0);
    setIsPlaying(false);
  }, [chapter.clips.length]);

  const storyMusicMode: StoryMusicMode =
    mode === "decision"
      ? "decision"
      : mode === "main" || mode === "branch"
        ? "gameplay"
        : "silent";

  return (
    <main
      className="relative isolate min-h-svh cursor-pointer overflow-hidden bg-black text-white"
      onClick={handleStageClick}
    >
      <StoryMusic
        masterVolume={volume}
        mode={storyMusicMode}
        musicVolume={musicVolume}
      />

      {videoSlots.map((filename, slot) =>
        filename ? (
          <video
            className={`absolute inset-0 size-full object-cover ${
              slot === activeSlot ? "z-10 visible" : "invisible z-0"
            }`}
            key={`${slot}-${filename}`}
            loop={
              slot === activeSlot &&
              mode === "decision" &&
              filename === videoFilename
            }
            muted={filename === "select_decision.mp4"}
            onCanPlay={() => void activateSlot(slot, filename)}
            onEnded={() => {
              if (slot === activeSlot) handleEnded();
            }}
            onTimeUpdate={(event) => {
              if (slot === activeSlot) {
                setCurrentTime(event.currentTarget.currentTime);
              }
            }}
            playsInline
            preload="auto"
            ref={(element) => {
              videoRefs.current[slot] = element;
            }}
            src={`/api/videos/${encodeURIComponent(filename)}`}
          />
        ) : null,
      )}

      {!videoFilename ? (
        <div aria-hidden="true" className="absolute inset-0 bg-black" />
      ) : null}

      {chapterVideoPending ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[60] bg-black"
          data-testid="chapter-video-cover"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.46),transparent_24%,transparent_68%,rgba(0,0,0,.5))]" />

      {mode !== "chapterIntro" ? (
        <header className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
          <Link
            className="block text-sm font-semibold tracking-[0.13em] text-white/65 transition hover:text-white sm:text-base"
            href="/"
          >
            정규직까지 D-7
          </Link>
          <p className="mt-1.5 text-base font-semibold text-white/92 sm:text-lg">
            {chapter.day} · {chapter.title}
          </p>
        </header>
      ) : null}

      {mode !== "complete" &&
      mode !== "chapterIntro" &&
      mode !== "decision" ? (
        <>
          <Button
            aria-label="현재 영상 건너뛰기"
            className="fixed right-[7.5rem] top-4 z-[90] size-11 rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/20 backdrop-blur-xl hover:bg-black/55 sm:right-[8rem] sm:top-6"
            onClick={skipCurrentVideo}
            size="icon-lg"
            title="영상 넘기기"
            variant="ghost"
          >
            <ChevronsRight />
          </Button>
          <Button
            aria-label={isPlaying ? "일시정지" : "재생"}
            className="fixed right-[4.25rem] top-4 z-[90] size-11 rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/20 backdrop-blur-xl hover:bg-black/55 sm:right-[4.75rem] sm:top-6"
            onClick={() => void togglePlayback()}
            size="icon-lg"
            variant="ghost"
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        </>
      ) : null}

      {mode === "decision" && chapter.choices ? (
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
            : decisionThought
        }
        scale={captionSize / 100}
      />

      {choiceFeedback ? (
        <ChoiceFeedback
          exiting={choiceFeedbackExiting}
          key={choiceFeedback}
          message={choiceFeedback}
        />
      ) : null}

      {mode === "chapterIntro" ? (
        <ChapterIntro
          description={chapter.title}
          effectsVolume={effectsVolume * volume}
          key={chapter.day}
          onComplete={finishChapterIntro}
          title={chapter.day}
        />
      ) : null}

      {mode === "complete" ? (
        <section className="absolute inset-0 z-30 grid cursor-default place-items-center bg-black px-5 text-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-white/45">
              AVAILABLE FOOTAGE COMPLETE
            </p>
            <h1 className="mt-3 text-2xl font-bold">
              현재 준비된 장면을 모두 재생했습니다.
            </h1>
            <Link
              className={`${buttonVariants({
                variant: "outline",
                size: "lg",
              })} mt-7`}
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
