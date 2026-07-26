const CAPTION_SIZE_STORAGE_KEY = "game-caption-size";

export function getInitialCaptionSize() {
  if (typeof window === "undefined") return 100;

  const storedSize = window.localStorage.getItem(
    CAPTION_SIZE_STORAGE_KEY,
  );
  if (storedSize !== null) return Number(storedSize);

  return window.matchMedia(
    "(max-width: 767px), (pointer: coarse) and (max-width: 1024px)",
  ).matches
    ? 75
    : 100;
}
