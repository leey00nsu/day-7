"use client";

import { useCallback, useRef, useState } from "react";

export function useStoryMediaBuffering() {
  const bufferingRef = useRef(false);
  const shouldResumeRef = useRef(false);
  const [buffering, setBuffering] = useState(false);

  const startBuffering = useCallback(() => {
    if (bufferingRef.current) return false;

    bufferingRef.current = true;
    shouldResumeRef.current = true;
    setBuffering(true);
    return true;
  }, []);

  const clearBuffering = useCallback(() => {
    bufferingRef.current = false;
    shouldResumeRef.current = false;
    setBuffering(false);
  }, []);

  return {
    buffering,
    clearBuffering,
    isBuffering: () => bufferingRef.current,
    shouldResume: () => shouldResumeRef.current,
    startBuffering,
  };
}
