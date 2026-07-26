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
import { EndingResultScreen } from "@/components/game/EndingResultScreen";
import { GameVideo } from "@/components/game/GameVideo";
import {
  useMediaAssetStorage,
  useMediaAssetUrl,
} from "@/components/game/MediaAssetProvider";
import {
  StoryMusic,
  type StoryMusicMode,
} from "@/components/game/StoryMusic";
import {
  NarrationAudio,
  type NarrationAudioHandle,
} from "@/components/game/NarrationAudio";
import { SubtitleOverlay } from "@/components/game/SubtitleOverlay";
import { useWebAudioSettings } from "@/components/game/WebAudioProvider";
import { useHowlerSound } from "@/components/game/useHowlerSound";
import { Button } from "@/components/ui/button";
import {
  endings,
  storyChapters,
  type EndingId,
  type StoryClip,
  type SubtitleCue,
} from "@/data/game";
import {
  resolveEndingFromChoices,
  unlockEnding,
} from "@/lib/ending-progress";
import { getInitialCaptionSize } from "@/lib/game-preferences";
import {
  recordChoice,
  recordEnding,
} from "@/lib/report-client";
import type { ChoiceMap } from "@/lib/report-types";

type PlaybackMode =
  | "chapterIntro"
  | "main"
  | "decision"
  | "branch"
  | "ending"
  | "endingNarration"
  | "complete";
type VideoSlots = [string | undefined, string | undefined];

const MIN_START_BUFFER_SECONDS = 4;
const NARRATION_RETRY_LIMIT = 2;

function findCue(cues: readonly SubtitleCue[] | undefined, time: number) {
  return cues?.find((cue) => time >= cue.start && time < cue.end);
}

function hasStartBuffer(
  video: HTMLVideoElement,
  requireDeepBuffer: boolean,
) {
  if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return false;
  if (!requireDeepBuffer) return true;
  if (!Number.isFinite(video.duration) || video.duration <= 0) return true;

  for (let index = 0; index < video.buffered.length; index += 1) {
    const start = video.buffered.start(index);
    const end = video.buffered.end(index);

    if (
      start <= video.currentTime + 0.05 &&
      end - video.currentTime >=
        Math.min(MIN_START_BUFFER_SECONDS, video.duration - video.currentTime)
    ) {
      return true;
    }
  }

  return video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
}

function mapCurrentChoices(choiceHistory: readonly number[]): ChoiceMap {
  const currentChoices: ChoiceMap = {};
  let decisionIndex = 0;

  for (const chapter of storyChapters) {
    if (!chapter.decisionId || !chapter.choices) continue;

    const selectedChoice = choiceHistory[decisionIndex];
    if (selectedChoice === 0 || selectedChoice === 1) {
      currentChoices[chapter.decisionId] = selectedChoice;
    }
    decisionIndex += 1;
  }

  return currentChoices;
}

export function GameScene() {
  const { storageMode } = useMediaAssetStorage();
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const narrationRef = useRef<NarrationAudioHandle>(null);
  const chapterIntroElapsedRef = useRef(false);
  const readyVideoFilenamesRef = useRef(new Set<string>());
  const startedSceneKeyRef = useRef<string | null>(null);
  const videoEndedRef = useRef(false);
  const narrationEndedRef = useRef(false);
  const resumeAfterBufferingRef = useRef(false);
  const wasPlayingBeforeHiddenRef = useRef(false);
  const startingSceneKeyRef = useRef<string | null>(null);
  const autoplayBlockedSceneKeyRef = useRef<string | null>(null);
  const currentSceneKeyRef = useRef<string | null>(null);
  const activeSlotRef = useRef(0);
  const mediaBufferingRef = useRef(false);
  const narrationRetryCountRef = useRef(0);
  const narrationRetryTimerRef = useRef<number | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [clipIndex, setClipIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [choiceHistory, setChoiceHistory] = useState<number[]>([]);
  const [achievedEndingId, setAchievedEndingId] =
    useState<EndingId | null>(null);
  const [mode, setMode] = useState<PlaybackMode>("chapterIntro");
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideoDuration, setCurrentVideoDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [choiceFeedback, setChoiceFeedback] = useState<string | null>(null);
  const [choiceFeedbackExiting, setChoiceFeedbackExiting] = useState(false);
  const [chapterVideoPending, setChapterVideoPending] = useState(false);
  const [narrationReadySource, setNarrationReadySource] = useState<
    string | null
  >(null);
  const [narrationFailedSource, setNarrationFailedSource] = useState<
    string | null
  >(null);
  const [mediaBuffering, setMediaBuffering] = useState(false);
  const [sceneMediaPending, setSceneMediaPending] = useState(false);
  const [resumeRequired, setResumeRequired] = useState(false);
  const [pageHidden, setPageHidden] = useState(false);
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
  const [captionSize, setCaptionSize] = useState(getInitialCaptionSize);
  const { masterVolume, soundEnabled } = useWebAudioSettings();
  const choiceFeedbackSrc = useMediaAssetUrl(
    "/audio/choice-feedback-chime.mp3",
  );
  const { play: playChoiceFeedback } = useHowlerSound({
    channel: "effects",
    gain: 0.675,
    muted: !soundEnabled || masterVolume <= 0,
    src: choiceFeedbackSrc,
  });

  const chapter = storyChapters[chapterIndex];
  const activeEnding = achievedEndingId
    ? endings.find((ending) => ending.id === achievedEndingId)
    : undefined;
  const currentChoices = useMemo(
    () => mapCurrentChoices(choiceHistory),
    [choiceHistory],
  );

  useEffect(() => {
    function updateCaptions(event: Event) {
      setCaptionsEnabled((event as CustomEvent<boolean>).detail);
    }

    function updateCaptionSize(event: Event) {
      setCaptionSize((event as CustomEvent<number>).detail);
    }

    window.addEventListener("game:captions", updateCaptions);
    window.addEventListener("game:caption-size", updateCaptionSize);

    return () => {
      window.removeEventListener("game:captions", updateCaptions);
      window.removeEventListener("game:caption-size", updateCaptionSize);
    };
  }, []);

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

    if (
      (mode === "ending" || mode === "endingNarration") &&
      activeEnding
    ) {
      return activeEnding.clips[clipIndex];
    }

    return undefined;
  }, [activeEnding, chapter, clipIndex, mode, selectedChoice]);

  const activeCue = captionsEnabled
    ? findCue(activeClip?.cues, currentTime)
    : undefined;
  const decisionThought =
    captionsEnabled && mode === "decision" && chapter.decisionThought
      ? {
          speaker: "김 인턴",
          text: chapter.decisionThought,
        }
      : undefined;

  const videoFilename =
    mode === "decision" ? "select_decision.mp4" : activeClip?.filename;
  const chapterEntryFilename =
    chapter.clips[0]?.filename ??
    (chapter.choices ? "select_decision.mp4" : undefined);
  const narrationFilename =
    mode === "decision"
      ? chapter.decisionNarration
      : mode === "endingNarration"
        ? activeEnding?.narrationAudio
        : activeClip?.narration;
  const hasPlayableNarration = Boolean(
    narrationFilename &&
      narrationFailedSource !== narrationFilename,
  );
  const videoGain = hasPlayableNarration ? 0.35 : 1;
  const sceneKey = [
    mode,
    chapterIndex,
    clipIndex,
    selectedChoice ?? "none",
    videoFilename ?? "no-video",
    narrationFilename ?? "no-narration",
    storageMode,
  ].join(":");
  currentSceneKeyRef.current = sceneKey;
  activeSlotRef.current = activeSlot;

  const preloadFilename = useMemo(() => {
    if (
      mode === "main" &&
      clipIndex === chapter.clips.length - 1 &&
      chapterIndex === storyChapters.length - 1
    ) {
      const nextEnding = endings.find(
        (ending) =>
          ending.id === resolveEndingFromChoices(choiceHistory),
      );

      return nextEnding?.clips[0]?.filename;
    }

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

    if (mode === "ending" && activeEnding) {
      return activeEnding.clips[clipIndex + 1]?.filename;
    }

    return undefined;
  }, [
    activeEnding,
    chapter,
    chapterIndex,
    choiceHistory,
    clipIndex,
    mode,
    selectedChoice,
  ]);

  const preloadNarrationFilename = useMemo(() => {
    const nextChapter = storyChapters[chapterIndex + 1];
    const nextChapterNarration =
      nextChapter?.clips[0]?.narration ??
      (nextChapter?.clips.length ? undefined : nextChapter?.decisionNarration);

    if (mode === "main") {
      const nextClip = chapter.clips[clipIndex + 1];
      if (nextClip) return nextClip.narration;

      return (
        chapter.choices
          ? chapter.decisionNarration
          : nextChapterNarration
      );
    }

    if (mode === "branch" && selectedChoice !== null && chapter.choices) {
      const branchClips = chapter.choices[selectedChoice].clips;
      const nextClip = branchClips[clipIndex + 1];
      if (nextClip) return nextClip.narration;

      return nextChapterNarration;
    }

    if (mode === "ending" && activeEnding) {
      const nextClip = activeEnding.clips[clipIndex + 1];
      return nextClip ? nextClip.narration : activeEnding.narrationAudio;
    }

    return undefined;
  }, [
    activeEnding,
    chapter,
    chapterIndex,
    clipIndex,
    mode,
    selectedChoice,
  ]);
  const preloadNarrationSrc = useMediaAssetUrl(
    preloadNarrationFilename,
  );

  useEffect(() => {
    if (narrationRetryTimerRef.current !== null) {
      window.clearTimeout(narrationRetryTimerRef.current);
      narrationRetryTimerRef.current = null;
    }

    startedSceneKeyRef.current = null;
    startingSceneKeyRef.current = null;
    autoplayBlockedSceneKeyRef.current = null;
    videoEndedRef.current = false;
    narrationEndedRef.current = !narrationFilename;
    resumeAfterBufferingRef.current = false;
    mediaBufferingRef.current = false;
    narrationRetryCountRef.current = 0;

    return () => {
      if (narrationRetryTimerRef.current !== null) {
        window.clearTimeout(narrationRetryTimerRef.current);
        narrationRetryTimerRef.current = null;
      }
    };
  }, [narrationFilename, sceneKey, videoFilename]);

  useEffect(() => {
    if (
      mode !== "chapterIntro" ||
      !chapterEntryFilename ||
      videoSlots.includes(chapterEntryFilename)
    ) {
      return;
    }

    const preloadSlot = activeSlot === 0 ? 1 : 0;
    const updateFrame = window.requestAnimationFrame(() => {
      setVideoSlots((slots) => {
        if (slots.includes(chapterEntryFilename)) return slots;

        const next: VideoSlots = [...slots];
        next[preloadSlot] = chapterEntryFilename;
        return next;
      });
    });

    return () => window.cancelAnimationFrame(updateFrame);
  }, [
    activeSlot,
    chapterEntryFilename,
    mode,
    videoSlots,
  ]);

  const startChapter = useCallback(() => {
    setChapterVideoPending(true);
    setSceneMediaPending(true);
    setMode(chapter.clips.length > 0 ? "main" : "decision");
    setCurrentTime(0);
    setIsPlaying(false);
  }, [chapter.clips.length]);

  const markVideoReady = useCallback(
    (filename: string, video: HTMLVideoElement) => {
      if (!hasStartBuffer(video, storageMode === "download")) return;

      readyVideoFilenamesRef.current.add(filename);

      if (
        mode === "chapterIntro" &&
        chapterIntroElapsedRef.current &&
        filename === chapterEntryFilename
      ) {
        startChapter();
      }
    },
    [chapterEntryFilename, mode, startChapter, storageMode],
  );

  const markNarrationReady = useCallback(() => {
    if (narrationFilename) {
      narrationRetryCountRef.current = 0;
      setNarrationFailedSource((failedSource) =>
        failedSource === narrationFilename ? null : failedSource,
      );
      setNarrationReadySource(narrationFilename);
    }
  }, [narrationFilename]);

  const activateSlot = useCallback(
    async (slot: number, filename: string) => {
      if (filename !== videoFilename) return;
      if (
        hasPlayableNarration &&
        narrationReadySource !== narrationFilename
      ) {
        return;
      }

      const nextVideo = videoRefs.current[slot];
      if (!nextVideo) return;

      if (slot !== activeSlot) {
        videoRefs.current[activeSlot]?.pause();
        narrationRef.current?.pause();

        if (preloadFilename) {
          setVideoSlots((slots) => {
            const next: VideoSlots = [...slots];
            next[activeSlot] = preloadFilename;
            return next;
          });
        }

        setActiveSlot(slot);
        return;
      }

      if (!hasStartBuffer(nextVideo, storageMode === "download")) return;
      if (
        startedSceneKeyRef.current === sceneKey ||
        startingSceneKeyRef.current === sceneKey ||
        autoplayBlockedSceneKeyRef.current === sceneKey
      ) {
        return;
      }

      startingSceneKeyRef.current = sceneKey;

      nextVideo.currentTime = 0;
      narrationRef.current?.reset();

      const videoPlayback = nextVideo.play();
      const narrationPlayback = hasPlayableNarration
        ? narrationRef.current?.play()
        : undefined;

      try {
        await Promise.all(
          [videoPlayback, narrationPlayback].filter(
            (playback): playback is Promise<void> => Boolean(playback),
          ),
        );
        if (currentSceneKeyRef.current !== sceneKey) return;

        startedSceneKeyRef.current = sceneKey;
        setCurrentTime(0);
        setChapterVideoPending(false);
        setSceneMediaPending(false);
      } catch (error) {
        if (currentSceneKeyRef.current !== sceneKey) return;

        nextVideo.pause();
        narrationRef.current?.pause();
        console.error("Failed to start scene media", error);
        setIsPlaying(false);
        setChapterVideoPending(false);
        setSceneMediaPending(false);

        if (error instanceof DOMException && error.name === "NotAllowedError") {
          autoplayBlockedSceneKeyRef.current = sceneKey;
          wasPlayingBeforeHiddenRef.current = true;
          setResumeRequired(true);
        }
      } finally {
        if (startingSceneKeyRef.current === sceneKey) {
          startingSceneKeyRef.current = null;
        }
      }
    },
    [
      activeSlot,
      hasPlayableNarration,
      narrationFilename,
      narrationReadySource,
      preloadFilename,
      sceneKey,
      storageMode,
      videoFilename,
    ],
  );

  const resumeBufferedMedia = useCallback(async () => {
    if (!mediaBufferingRef.current || !resumeAfterBufferingRef.current) return;

    const video = videoRefs.current[activeSlot];
    const narration = narrationRef.current;
    const videoReady =
      !videoFilename ||
      videoEndedRef.current ||
      (video && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA);
    const narrationReady =
      !hasPlayableNarration ||
      narrationEndedRef.current ||
      (narration &&
        narration.readyState() >= HTMLMediaElement.HAVE_FUTURE_DATA);

    if (!videoReady || !narrationReady) return;

    const expectedSceneKey = sceneKey;

    try {
      await Promise.all(
        [
          videoFilename && !videoEndedRef.current
            ? video?.play()
            : undefined,
          hasPlayableNarration && !narrationEndedRef.current
            ? narration?.play()
            : undefined,
        ].filter(
          (playback): playback is Promise<void> => Boolean(playback),
        ),
      );
      if (currentSceneKeyRef.current !== expectedSceneKey) return;

      resumeAfterBufferingRef.current = false;
      mediaBufferingRef.current = false;
      setMediaBuffering(false);
    } catch (error) {
      if (currentSceneKeyRef.current !== expectedSceneKey) return;

      video?.pause();
      narration?.pause();
      resumeAfterBufferingRef.current = false;
      mediaBufferingRef.current = false;
      setMediaBuffering(false);
      setIsPlaying(false);
      console.error("Failed to resume buffered scene media", error);
    }
  }, [
    activeSlot,
    hasPlayableNarration,
    sceneKey,
    videoFilename,
  ]);

  useEffect(() => {
    if (!videoFilename) return;

    if (videoSlots[activeSlot] === videoFilename) {
      const currentVideo = videoRefs.current[activeSlot];

      if (
        currentVideo &&
        hasStartBuffer(currentVideo, storageMode === "download")
      ) {
        void activateSlot(activeSlot, videoFilename);
      }
      return;
    }

    const nextSlot =
      storageMode === "stream" ? activeSlot : activeSlot === 0 ? 1 : 0;
    const waitingVideo = videoRefs.current[nextSlot];

    if (videoSlots[nextSlot] === videoFilename) {
      if (
        waitingVideo &&
        waitingVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
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
    storageMode,
    videoFilename,
    videoSlots,
  ]);

  useEffect(() => {
    if (
      videoFilename ||
      !hasPlayableNarration ||
      narrationReadySource !== narrationFilename ||
      startedSceneKeyRef.current === sceneKey
    ) {
      return;
    }

    let cancelled = false;

    async function startNarrationOnlyScene() {
      narrationRef.current?.reset();

      try {
        await narrationRef.current?.play();
        if (cancelled) return;
        if (currentSceneKeyRef.current !== sceneKey) return;

        startedSceneKeyRef.current = sceneKey;
        setChapterVideoPending(false);
        setSceneMediaPending(false);
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to start narration-only scene", error);
        setIsPlaying(false);
        setChapterVideoPending(false);
      }
    }

    void startNarrationOnlyScene();
    return () => {
      cancelled = true;
    };
  }, [
    hasPlayableNarration,
    narrationFilename,
    narrationReadySource,
    sceneKey,
    videoFilename,
  ]);

  function advanceChapter(completedChoices = choiceHistory) {
    mediaBufferingRef.current = false;
    setMediaBuffering(false);
    setSceneMediaPending(false);

    if (chapterIndex < storyChapters.length - 1) {
      for (const video of videoRefs.current) {
        video?.pause();
      }
      setChapterIndex((value) => value + 1);
      setClipIndex(0);
      setSelectedChoice(null);
      setMode("chapterIntro");
      chapterIntroElapsedRef.current = false;
      setCurrentTime(0);
      setIsPlaying(false);
      return;
    }

    const endingId = resolveEndingFromChoices(completedChoices);
    const ending = endings.find((candidate) => candidate.id === endingId);

    setAchievedEndingId(endingId);
    setClipIndex(0);
    setSelectedChoice(null);
    setMode(ending?.clips.length ? "ending" : "endingNarration");
    setSceneMediaPending(Boolean(ending?.clips.length));
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function completeEnding() {
    if (!achievedEndingId) return;

    unlockEnding(achievedEndingId);
    void recordEnding(achievedEndingId);
    setMode("complete");
    setCurrentTime(0);
    setIsPlaying(false);
  }

  function handleVideoEnded() {
    videoEndedRef.current = true;

    if (!narrationFilename || narrationEndedRef.current) {
      handleEnded();
    }
  }

  function handleNarrationEnded() {
    narrationEndedRef.current = true;

    if (mode === "endingNarration") {
      completeEnding();
      return;
    }

    if (mode !== "decision" && videoEndedRef.current) {
      handleEnded();
    }
  }

  function handleNarrationError() {
    if (!narrationFilename) return;

    if (narrationRetryCountRef.current < NARRATION_RETRY_LIMIT) {
      narrationRetryCountRef.current += 1;
      const expectedSceneKey = sceneKey;

      narrationRetryTimerRef.current = window.setTimeout(() => {
        narrationRetryTimerRef.current = null;
        if (currentSceneKeyRef.current !== expectedSceneKey) return;

        setNarrationReadySource(null);
        narrationRef.current?.reload();
      }, 450 * narrationRetryCountRef.current);
      return;
    }

    console.error(`Failed to load narration: ${narrationFilename}`);
    narrationEndedRef.current = true;
    setNarrationFailedSource(narrationFilename);
    setNarrationReadySource(narrationFilename);

    if (mode === "endingNarration") {
      completeEnding();
    } else if (mode !== "decision" && videoEndedRef.current) {
      handleEnded();
    }
  }

  function pauseForBuffering() {
    if (
      !isPlaying ||
      startedSceneKeyRef.current !== sceneKey ||
      mediaBufferingRef.current
    ) {
      return;
    }

    mediaBufferingRef.current = true;
    resumeAfterBufferingRef.current = true;
    videoRefs.current[activeSlot]?.pause();
    narrationRef.current?.pause();
    setMediaBuffering(true);
    setIsPlaying(false);
  }

  function handleEnded() {
    startedSceneKeyRef.current = null;
    startingSceneKeyRef.current = null;
    videoEndedRef.current = false;
    narrationEndedRef.current = false;
    mediaBufferingRef.current = false;
    setMediaBuffering(false);
    setIsPlaying(false);

    if (mode === "main") {
      if (clipIndex < chapter.clips.length - 1) {
        setSceneMediaPending(true);
        setClipIndex((value) => value + 1);
      } else if (chapter.choices) {
        setSceneMediaPending(true);
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
        setSceneMediaPending(true);
        setClipIndex((value) => value + 1);
      } else {
        advanceChapter();
      }
    } else if (mode === "ending" && activeEnding) {
      if (clipIndex < activeEnding.clips.length - 1) {
        setSceneMediaPending(true);
        setClipIndex((value) => value + 1);
      } else {
        setSceneMediaPending(false);
        setMode("endingNarration");
        setIsPlaying(true);
      }
    }

    setCurrentTime(0);
  }

  function choose(index: number) {
    if (!chapter.choices) return;

    videoRefs.current[activeSlot]?.pause();
    narrationRef.current?.pause();

    playChoiceFeedback({ restart: true });

    if (chapter.decisionId && (index === 0 || index === 1)) {
      recordChoice(chapter.decisionId, index);
    }

    const branchClips = chapter.choices[index].clips;
    const nextChoiceHistory = [...choiceHistory, index];
    setChoiceHistory(nextChoiceHistory);
    setChoiceFeedbackExiting(false);
    setChoiceFeedback(chapter.choices[index].feedback);
    mediaBufferingRef.current = false;
    setMediaBuffering(false);
    setIsPlaying(false);
    setSelectedChoice(index);
    setCurrentTime(0);
    setClipIndex(0);

    if (branchClips.length === 0) {
      advanceChapter(nextChoiceHistory);
      return;
    }

    setSceneMediaPending(true);
    setMode("branch");
  }

  async function togglePlayback() {
    if (mode === "endingNarration") {
      if (isPlaying) {
        narrationRef.current?.pause();
        setIsPlaying(false);
      } else {
        try {
          await narrationRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Failed to toggle ending narration", error);
          setIsPlaying(false);
        }
      }
      return;
    }

    if (mode !== "main" && mode !== "branch" && mode !== "ending") {
      return;
    }

    const video = videoRefs.current[activeSlot];
    if (!video) return;

    if (isPlaying) {
      video.pause();
      narrationRef.current?.pause();
      setIsPlaying(false);
    } else {
      try {
        await Promise.all(
          [
            videoEndedRef.current ? undefined : video.play(),
            hasPlayableNarration && !narrationEndedRef.current
              ? narrationRef.current?.play()
              : undefined,
          ].filter(
            (playback): playback is Promise<void> => Boolean(playback),
          ),
        );
      } catch (error) {
        video.pause();
        narrationRef.current?.pause();
        console.error("Failed to toggle scene playback", error);
        setIsPlaying(false);
      }
    }
  }

  function skipCurrentVideo() {
    if (mode !== "main" && mode !== "branch" && mode !== "ending") return;

    videoRefs.current[activeSlot]?.pause();
    narrationRef.current?.pause();
    handleEnded();
  }

  function handleStageClick(event: MouseEvent<HTMLElement>) {
    if (mode === "decision") return;

    const target = event.target as HTMLElement;

    if (target.closest("a, button, input, label")) return;
    void togglePlayback();
  }

  const finishChapterIntro = useCallback(() => {
    chapterIntroElapsedRef.current = true;

    if (
      !chapterEntryFilename ||
      readyVideoFilenamesRef.current.has(chapterEntryFilename)
    ) {
      startChapter();
    }
  }, [chapterEntryFilename, startChapter]);

  const resumeInterruptedPlayback = useCallback(async () => {
    const expectedSceneKey = sceneKey;
    autoplayBlockedSceneKeyRef.current = null;

    try {
      const video = videoRefs.current[activeSlot];

      await Promise.all(
        [
          videoFilename && !videoEndedRef.current
            ? video?.play()
            : undefined,
          hasPlayableNarration && !narrationEndedRef.current
            ? narrationRef.current?.play()
            : undefined,
        ].filter(
          (playback): playback is Promise<void> => Boolean(playback),
        ),
      );
      if (currentSceneKeyRef.current !== expectedSceneKey) return;

      startedSceneKeyRef.current = expectedSceneKey;
      wasPlayingBeforeHiddenRef.current = false;
      setResumeRequired(false);
      setChapterVideoPending(false);
      setSceneMediaPending(false);
    } catch (error) {
      console.error("Failed to resume interrupted playback", error);
      setIsPlaying(false);
    }
  }, [
    activeSlot,
    hasPlayableNarration,
    sceneKey,
    videoFilename,
  ]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        setPageHidden(true);
        wasPlayingBeforeHiddenRef.current = isPlaying;

        if (isPlaying) {
          videoRefs.current[activeSlot]?.pause();
          narrationRef.current?.pause();
          setIsPlaying(false);
        }
        return;
      }

      setPageHidden(false);
      if (wasPlayingBeforeHiddenRef.current) {
        setResumeRequired(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
  }, [activeSlot, isPlaying]);

  const storyMusicMode: StoryMusicMode =
    pageHidden || resumeRequired
      ? "silent"
      : mode === "decision"
      ? "decision"
      : mode === "main" ||
          mode === "branch" ||
          mode === "ending" ||
          mode === "endingNarration" ||
          mode === "complete"
        ? "gameplay"
        : "silent";

  const endingNarrationLine =
    captionsEnabled && mode === "endingNarration" && activeEnding
      ? {
          speaker: "김 인턴",
          text: activeEnding.narrationText,
        }
      : undefined;
  const isLastEndingClip =
    mode === "ending" &&
    activeEnding &&
    clipIndex === activeEnding.clips.length - 1;
  const endingFadeOpacity =
    mode === "endingNarration"
      ? 1
      : isLastEndingClip &&
          Number.isFinite(currentVideoDuration) &&
          currentVideoDuration > 0
        ? Math.min(
            Math.max(
              (currentTime - currentVideoDuration * 0.5) /
                (currentVideoDuration * 0.5),
              0,
            ),
            1,
          )
        : 0;

  return (
    <main
      className="relative isolate min-h-svh cursor-pointer overflow-hidden bg-black text-white"
      onClick={handleStageClick}
    >
      <StoryMusic
        mode={storyMusicMode}
        suspended={!soundEnabled || pageHidden || resumeRequired}
      />
      <NarrationAudio
        muted={!soundEnabled || masterVolume <= 0}
        onEnded={handleNarrationEnded}
        onError={handleNarrationError}
        onPause={() => {
          if (!videoFilename) setIsPlaying(false);
        }}
        onPlaying={() => {
          if (!videoFilename) setIsPlaying(true);
        }}
        onReady={() => {
          markNarrationReady();
          void resumeBufferedMedia();
        }}
        onStalled={pauseForBuffering}
        onWaiting={pauseForBuffering}
        ref={narrationRef}
        src={narrationFilename}
      />
      {preloadNarrationFilename &&
      preloadNarrationFilename !== narrationFilename ? (
        <audio
          aria-hidden="true"
          crossOrigin="anonymous"
          muted
          preload={storageMode === "download" ? "auto" : "metadata"}
          src={preloadNarrationSrc}
        />
      ) : null}
      {videoSlots.map((filename, slot) =>
        filename ? (
          <GameVideo
            audioGain={videoGain}
            className={`absolute inset-0 size-full object-cover max-md:object-contain ${
              slot === activeSlot ? "z-10 visible" : "invisible z-0"
            }`}
            filename={filename}
            key={slot}
            loop={
              slot === activeSlot &&
              mode === "decision" &&
              filename === videoFilename
            }
            muted={
              !soundEnabled ||
              masterVolume <= 0 ||
              filename === "select_decision.mp4"
            }
            onCanPlay={(event) => {
              markVideoReady(filename, event.currentTarget);
              void activateSlot(slot, filename);
              if (slot === activeSlot) {
                void resumeBufferedMedia();
              }
            }}
            onCanPlayThrough={(event) => {
              markVideoReady(filename, event.currentTarget);
              void activateSlot(slot, filename);
              if (slot === activeSlotRef.current) {
                void resumeBufferedMedia();
              }
            }}
            onEnded={() => {
              if (slot === activeSlotRef.current) handleVideoEnded();
            }}
            onPause={() => {
              if (slot === activeSlotRef.current) setIsPlaying(false);
            }}
            onPlaying={() => {
              if (slot === activeSlotRef.current) setIsPlaying(true);
            }}
            onProgress={(event) => {
              markVideoReady(filename, event.currentTarget);
              void activateSlot(slot, filename);
              if (slot === activeSlotRef.current) {
                void resumeBufferedMedia();
              }
            }}
            onStalled={() => {
              if (slot === activeSlotRef.current) pauseForBuffering();
            }}
            onWaiting={() => {
              if (slot === activeSlotRef.current) pauseForBuffering();
            }}
            onTimeUpdate={(event) => {
              if (slot === activeSlotRef.current) {
                setCurrentTime(event.currentTarget.currentTime);
                setCurrentVideoDuration(event.currentTarget.duration);
              }
            }}
            playsInline
            preload={
              storageMode === "download" || slot === activeSlot
                ? "auto"
                : "metadata"
            }
            ref={(element) => {
              videoRefs.current[slot] = element;
            }}
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

      {resumeRequired ? (
        <div className="fixed inset-0 z-[190] grid place-items-center bg-black/60 px-6 backdrop-blur-sm">
          <Button
            className="min-w-40"
            onClick={() => void resumeInterruptedPlayback()}
            size="lg"
            variant="outline"
          >
            계속하기
          </Button>
        </div>
      ) : null}

      {(mediaBuffering || sceneMediaPending) && !resumeRequired ? (
        <div
          aria-label="재생 준비 중"
          className="pointer-events-none fixed inset-0 z-[80] grid place-items-center"
          role="status"
        >
          <span
            aria-hidden="true"
            className="size-11 animate-spin rounded-full border-[3px] border-white/25 border-t-white drop-shadow-[0_2px_12px_rgba(0,0,0,.8)]"
          />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.46),transparent_24%,transparent_68%,rgba(0,0,0,.5))]" />

      {isLastEndingClip || mode === "endingNarration" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-300 ease-linear"
          style={{ opacity: endingFadeOpacity }}
        />
      ) : null}

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

      {mode === "main" || mode === "branch" || mode === "ending" ? (
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

      {mode === "endingNarration" ? (
        <Button
          aria-label={isPlaying ? "일시정지" : "재생"}
          className="fixed right-[4.25rem] top-4 z-[90] size-11 rounded-full border border-white/15 bg-black/35 text-white shadow-lg shadow-black/20 backdrop-blur-xl hover:bg-black/55 sm:right-[4.75rem] sm:top-6"
          onClick={() => void togglePlayback()}
          size="icon-lg"
          variant="ghost"
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>
      ) : null}

      {mode === "decision" && chapter.choices ? (
        <DecisionOverlay
          choices={[
            chapter.choices[0].label,
            chapter.choices[1].label,
          ]}
          onChoose={choose}
          prompt={chapter.decisionPrompt ?? ""}
        />
      ) : null}

      <SubtitleOverlay
        line={
          endingNarrationLine ??
          (activeCue
            ? { speaker: activeCue.speaker, text: activeCue.text }
            : decisionThought)
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
          key={chapter.day}
          muted={!soundEnabled || masterVolume <= 0}
          onComplete={finishChapterIntro}
          title={chapter.day}
        />
      ) : null}

      {mode === "complete" ? (
        activeEnding ? (
          <EndingResultScreen
            currentChoices={currentChoices}
            ending={activeEnding}
          />
        ) : null
      ) : null}
    </main>
  );
}
