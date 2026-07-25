import type { EndingId } from "@/data/game";

export const ENDING_PROGRESS_STORAGE_KEY = "d7-unlocked-endings";
export const LAST_ENDING_STORAGE_KEY = "d7-last-ending";

const endingIds = new Set<EndingId>(["E01", "E02", "E03"]);

export function parseUnlockedEndingIds(storedValue: string): EndingId[] {
  try {
    const stored = JSON.parse(storedValue);

    return Array.isArray(stored)
      ? stored.filter(
          (value): value is EndingId =>
            typeof value === "string" && endingIds.has(value as EndingId),
        )
      : [];
  } catch {
    return [];
  }
}

export function parseLastEndingId(storedValue: string): EndingId | null {
  return endingIds.has(storedValue as EndingId)
    ? (storedValue as EndingId)
    : null;
}

export function getEndingProgressSnapshot() {
  return typeof window === "undefined"
    ? "[]"
    : (window.localStorage.getItem(ENDING_PROGRESS_STORAGE_KEY) ?? "[]");
}

export function getLastEndingSnapshot() {
  return typeof window === "undefined"
    ? ""
    : (window.localStorage.getItem(LAST_ENDING_STORAGE_KEY) ?? "");
}

export function subscribeToEndingProgress(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (
      event.key === ENDING_PROGRESS_STORAGE_KEY ||
      event.key === LAST_ENDING_STORAGE_KEY
    ) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("game:ending-unlocked", onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("game:ending-unlocked", onStoreChange);
  };
}

export function getUnlockedEndingIds(): EndingId[] {
  return parseUnlockedEndingIds(getEndingProgressSnapshot());
}

export function unlockEnding(endingId: EndingId) {
  if (typeof window === "undefined") return;

  const unlocked = new Set(getUnlockedEndingIds());
  unlocked.add(endingId);
  window.localStorage.setItem(
    ENDING_PROGRESS_STORAGE_KEY,
    JSON.stringify([...unlocked]),
  );
  window.localStorage.setItem(LAST_ENDING_STORAGE_KEY, endingId);
  window.dispatchEvent(new Event("game:ending-unlocked"));
}

export function resolveEndingFromChoices(
  choiceHistory: readonly number[],
): EndingId {
  const principledChoiceCount = choiceHistory.filter(
    (choice) => choice === 1,
  ).length;

  if (principledChoiceCount === 4) return "E03";
  if (principledChoiceCount >= 2) return "E02";
  return "E01";
}
