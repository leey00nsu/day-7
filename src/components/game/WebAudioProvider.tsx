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

export function WebAudioProvider({ children }: { children: ReactNode }) {
  const graphRef = useRef<AudioGraph | null>(null);
  const mediaBindingsRef = useRef(
    new WeakMap<HTMLMediaElement, MediaBinding>(),
  );
  const webAudioUnavailableRef = useRef(false);
  const [settings, setSettings] = useState(readAudioSettings);

  const applySettings = useCallback((nextSettings: AudioSettings) => {
    const graph = graphRef.current;
    if (!graph) return;

    const now = graph.context.currentTime;
    const enabledMasterVolume = nextSettings.soundEnabled
      ? nextSettings.masterVolume
      : 0;

    graph.master.gain.setValueAtTime(enabledMasterVolume, now);
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
      const context = new AudioContext();
      const master = context.createGain();
      const voice = context.createGain();
      const music = context.createGain();
      const effects = context.createGain();

      voice.connect(master);
      music.connect(master);
      effects.connect(master);
      master.connect(context.destination);

      const graph = { context, effects, master, music, voice };
      graphRef.current = graph;
      applySettings(readAudioSettings());
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

  const resumeAudioGraph = useCallback(() => {
    const currentSettings = readAudioSettings();
    if (!currentSettings.soundEnabled || currentSettings.masterVolume <= 0) {
      return;
    }

    const graph = ensureAudioGraph();
    if (!graph || graph.context.state === "running") return;

    void graph.context.resume().catch((error) => {
      console.warn("Web Audio 재개가 브라우저에 의해 보류되었습니다.", error);
    });
  }, [ensureAudioGraph]);

  const registerMediaElement = useCallback(
    (element: HTMLMediaElement, channel: WebAudioChannel) => {
      const existingBinding = mediaBindingsRef.current.get(element);
      if (existingBinding) return existingBinding;

      const currentSettings = readAudioSettings();
      if (!currentSettings.soundEnabled) return null;

      const graph = ensureAudioGraph();
      if (!graph) return null;

      try {
        const source = graph.context.createMediaElementSource(element);
        const gain = graph.context.createGain();
        const channelGain = graph[channel];

        source.connect(gain);
        gain.connect(channelGain);

        const binding = { channel, gain };
        mediaBindingsRef.current.set(element, binding);
        element.volume = 1;
        return binding;
      } catch (error) {
        console.error("미디어를 Web Audio에 연결하지 못했습니다.", error);
        return null;
      }
    },
    [ensureAudioGraph],
  );

  useEffect(() => {
    function updateSettings() {
      const nextSettings = readAudioSettings();
      setSettings(nextSettings);
      applySettings(nextSettings);

      if (nextSettings.soundEnabled && nextSettings.masterVolume > 0) {
        resumeAudioGraph();
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
      resumeAudioGraph();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") resumeAudioGraph();
    }

    window.addEventListener("click", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    window.addEventListener("pointerup", unlockAudio, true);
    window.addEventListener("touchend", unlockAudio, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("click", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
      window.removeEventListener("pointerup", unlockAudio, true);
      window.removeEventListener("touchend", unlockAudio, true);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [resumeAudioGraph]);

  const value = useMemo(
    () => ({ ...settings, registerMediaElement }),
    [registerMediaElement, settings],
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
    masterVolume,
    musicVolume,
    muted,
    rampMs,
    ref,
    registerMediaElement,
    soundEnabled,
  ]);
}
