"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Howler } from "howler";

export type WebAudioChannel = "voice" | "music" | "effects";

type AudioSettings = {
  effectsVolume: number;
  masterVolume: number;
  musicVolume: number;
  soundEnabled: boolean;
};

type MediaBinding = {
  channel: WebAudioChannel;
  gain: GainNode;
};

type AudioGraph = {
  context: AudioContext;
  effects: GainNode;
  master: GainNode;
  music: GainNode;
  voice: GainNode;
};

type WebAudioContextValue = AudioSettings & {
  graphRevision: number;
  registerMediaElement: (
    element: HTMLMediaElement,
    channel: WebAudioChannel,
  ) => MediaBinding | null;
};

type UseWebAudioMediaOptions = {
  channel: WebAudioChannel;
  gain?: number;
  muted?: boolean;
  rampMs?: number;
};

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  effectsVolume: 0.4,
  masterVolume: 0.8,
  musicVolume: 0.28,
  soundEnabled: false,
};

const WebAudioContext = createContext<WebAudioContextValue>({
  ...DEFAULT_AUDIO_SETTINGS,
  graphRevision: 0,
  registerMediaElement: () => null,
});

function clamp(value: number, minimum = 0, maximum = 1) {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(Math.max(value, minimum), maximum);
}

function storedVolume(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback / 100;

  const stored = Number(window.localStorage.getItem(key) ?? fallback);
  return clamp(stored, 0, 100) / 100;
}

function readAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return DEFAULT_AUDIO_SETTINGS;

  return {
    effectsVolume: storedVolume("game-effects-volume", 40),
    masterVolume: storedVolume("game-volume", 80),
    musicVolume: storedVolume("game-music-volume", 28),
    soundEnabled:
      window.localStorage.getItem("game-sound-choice") === "enabled",
  };
}

function connectMediaElement(
  graph: AudioGraph,
  bindings: WeakMap<HTMLMediaElement, MediaBinding>,
  element: HTMLMediaElement,
  channel: WebAudioChannel,
) {
  const existingBinding = bindings.get(element);
  if (existingBinding) return existingBinding;

  const source = graph.context.createMediaElementSource(element);
  const gain = graph.context.createGain();

  source.connect(gain);
  gain.connect(graph[channel]);

  const binding = { channel, gain };
  bindings.set(element, binding);
  element.volume = 1;
  return binding;
}

export function WebAudioProvider({ children }: { children: ReactNode }) {
  const graphRef = useRef<AudioGraph | null>(null);
  const mediaBindingsRef = useRef(
    new WeakMap<HTMLMediaElement, MediaBinding>(),
  );
  const pendingMediaRef = useRef(
    new Map<HTMLMediaElement, WebAudioChannel>(),
  );
  const webAudioUnavailableRef = useRef(false);
  const [graphRevision, setGraphRevision] = useState(0);
  const [settings, setSettings] = useState(readAudioSettings);

  const applySettings = useCallback((nextSettings: AudioSettings) => {
    const graph = graphRef.current;
    if (!graph) return;

    const now = graph.context.currentTime;
    Howler.volume(nextSettings.masterVolume);
    Howler.mute(!nextSettings.soundEnabled);
    graph.voice.gain.setValueAtTime(1, now);
    graph.music.gain.setValueAtTime(nextSettings.musicVolume, now);
    graph.effects.gain.setValueAtTime(nextSettings.effectsVolume, now);
  }, []);

  const ensureAudioGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current;
    if (webAudioUnavailableRef.current || typeof window === "undefined") {
      return null;
    }

    try {
      Howler.autoUnlock = true;
      Howler.autoSuspend = false;
      Howler.volume(readAudioSettings().masterVolume);

      if (!Howler.usingWebAudio || !Howler.ctx || !Howler.masterGain) {
        throw new Error("Web Audio is not available.");
      }

      const context = Howler.ctx;
      const master = Howler.masterGain;
      const voice = context.createGain();
      const music = context.createGain();
      const effects = context.createGain();

      voice.connect(master);
      music.connect(master);
      effects.connect(master);

      const graph = { context, effects, master, music, voice };
      graphRef.current = graph;
      applySettings(readAudioSettings());

      for (const [element, channel] of pendingMediaRef.current) {
        try {
          connectMediaElement(
            graph,
            mediaBindingsRef.current,
            element,
            channel,
          );
        } catch (error) {
          console.error("미디어를 Web Audio에 연결하지 못했습니다.", error);
        }
      }
      pendingMediaRef.current.clear();
      setGraphRevision((revision) => revision + 1);
      return graph;
    } catch (error) {
      webAudioUnavailableRef.current = true;
      console.error(
        "Web Audio를 초기화하지 못해 기본 미디어 볼륨으로 전환합니다.",
        error,
      );
      return null;
    }
  }, [applySettings]);

  const resumeAudioGraph = useCallback(
    (allowCreate = false) => {
      const currentSettings = readAudioSettings();
      if (
        !currentSettings.soundEnabled ||
        currentSettings.masterVolume <= 0
      ) {
        return;
      }

      const graph =
        graphRef.current ?? (allowCreate ? ensureAudioGraph() : null);
      if (!graph || graph.context.state === "running") return;

      void graph.context.resume().catch((error) => {
        console.warn(
          "Web Audio 재개가 브라우저에 의해 보류되었습니다.",
          error,
        );
      });
    },
    [ensureAudioGraph],
  );

  const registerMediaElement = useCallback(
    (element: HTMLMediaElement, channel: WebAudioChannel) => {
      const existingBinding = mediaBindingsRef.current.get(element);
      if (existingBinding) return existingBinding;

      const currentSettings = readAudioSettings();
      if (!currentSettings.soundEnabled) {
        pendingMediaRef.current.delete(element);
        return null;
      }

      const graph = graphRef.current;
      if (!graph) {
        pendingMediaRef.current.set(element, channel);
        return null;
      }

      try {
        pendingMediaRef.current.delete(element);
        return connectMediaElement(
          graph,
          mediaBindingsRef.current,
          element,
          channel,
        );
      } catch (error) {
        console.error("미디어를 Web Audio에 연결하지 못했습니다.", error);
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    const currentSettings = readAudioSettings();
    if (
      currentSettings.soundEnabled &&
      currentSettings.masterVolume > 0
    ) {
      const setupFrame = window.requestAnimationFrame(() => {
        ensureAudioGraph();
      });
      return () => window.cancelAnimationFrame(setupFrame);
    }
  }, [ensureAudioGraph]);

  useEffect(() => {
    function updateSettings() {
      const nextSettings = readAudioSettings();
      setSettings(nextSettings);
      applySettings(nextSettings);

      if (nextSettings.soundEnabled && nextSettings.masterVolume > 0) {
        resumeAudioGraph(true);
      }
    }

    window.addEventListener("game:volume", updateSettings);
    window.addEventListener("game:music-volume", updateSettings);
    window.addEventListener("game:effects-volume", updateSettings);
    window.addEventListener("game:sound-choice", updateSettings);

    return () => {
      window.removeEventListener("game:volume", updateSettings);
      window.removeEventListener("game:music-volume", updateSettings);
      window.removeEventListener("game:effects-volume", updateSettings);
      window.removeEventListener("game:sound-choice", updateSettings);
    };
  }, [applySettings, resumeAudioGraph]);

  useEffect(() => {
    function unlockAudio() {
      resumeAudioGraph(true);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") resumeAudioGraph();
    }

    window.addEventListener("click", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("pointerup", unlockAudio, true);
    window.addEventListener("touchend", unlockAudio, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("click", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("pointerup", unlockAudio, true);
      window.removeEventListener("touchend", unlockAudio, true);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [resumeAudioGraph]);

  const value = useMemo(
    () => ({ ...settings, graphRevision, registerMediaElement }),
    [graphRevision, registerMediaElement, settings],
  );

  return (
    <WebAudioContext.Provider value={value}>
      {children}
    </WebAudioContext.Provider>
  );
}

export function useWebAudioSettings() {
  return useContext(WebAudioContext);
}

export function useWebAudioMedia<T extends HTMLMediaElement>(
  ref: RefObject<T | null>,
  {
    channel,
    gain = 1,
    muted = false,
    rampMs = 0,
  }: UseWebAudioMediaOptions,
) {
  const {
    effectsVolume,
    graphRevision,
    masterVolume,
    musicVolume,
    registerMediaElement,
    soundEnabled,
  } = useWebAudioSettings();

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const hardMuted = muted || !soundEnabled || masterVolume <= 0;
    const sourceGain = clamp(gain);
    const binding = registerMediaElement(element, channel);

    element.muted = hardMuted;

    if (!binding) {
      const channelVolume =
        channel === "music"
          ? musicVolume
          : channel === "effects"
            ? effectsVolume
            : 1;

      element.volume = hardMuted
        ? 0
        : clamp(masterVolume * channelVolume * sourceGain);
      return;
    }

    element.volume = 1;

    const context = binding.gain.context;
    const parameter = binding.gain.gain;
    const targetGain = hardMuted ? 0 : sourceGain;
    const now = context.currentTime;

    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(parameter.value, now);

    if (rampMs > 0 && context.state !== "closed") {
      parameter.linearRampToValueAtTime(
        targetGain,
        now + rampMs / 1000,
      );
    } else {
      parameter.setValueAtTime(targetGain, now);
    }
  }, [
    channel,
    effectsVolume,
    gain,
    graphRevision,
    masterVolume,
    musicVolume,
    muted,
    rampMs,
    ref,
    registerMediaElement,
    soundEnabled,
  ]);
}
