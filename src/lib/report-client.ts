"use client";

import type { DecisionId, EndingId } from "@/data/game";
import type { ChoiceMap, ReportData } from "@/lib/report-types";

const PLAYER_ID_STORAGE_KEY = "d7-anonymous-player-id";
const CHOICES_STORAGE_KEY = "d7-choices";
const PREVIOUS_CHOICES_STORAGE_KEY = "d7-first-choices";
const playerIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getPlayerId() {
  const stored = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);

  if (stored && playerIdPattern.test(stored)) {
    return stored;
  }

  const playerId = window.crypto.randomUUID();
  window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
  return playerId;
}

export function parseChoices(storedValue: string): ChoiceMap {
  try {
    const stored = JSON.parse(storedValue);

    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(stored).filter(
        ([, value]) => value === 0 || value === 1,
      ),
    ) as ChoiceMap;
  } catch {
    return {};
  }
}

export function getChoices(): ChoiceMap {
  return parseChoices(getChoicesSnapshot());
}

export function getChoicesSnapshot() {
  if (typeof window === "undefined") return "{}";

  return (
    window.localStorage.getItem(CHOICES_STORAGE_KEY) ??
    window.localStorage.getItem(PREVIOUS_CHOICES_STORAGE_KEY) ??
    "{}"
  );
}

export function subscribeToChoices(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (
      event.key === CHOICES_STORAGE_KEY ||
      event.key === PREVIOUS_CHOICES_STORAGE_KEY
    ) {
      onStoreChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("game:choice", onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("game:choice", onStoreChange);
  };
}

async function postReportEvent(body: object) {
  const response = await fetch("/api/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to save report event");
  }
}

export function recordChoice(
  decisionId: DecisionId,
  choiceIndex: 0 | 1,
) {
  if (typeof window === "undefined") return;

  const choices = getChoices();
  choices[decisionId] = choiceIndex;
  window.localStorage.setItem(
    CHOICES_STORAGE_KEY,
    JSON.stringify(choices),
  );
  window.localStorage.removeItem(PREVIOUS_CHOICES_STORAGE_KEY);
  window.dispatchEvent(new Event("game:choice"));

  void postReportEvent({
    type: "choice",
    playerId: getPlayerId(),
    decisionId,
    choiceIndex,
  }).catch(() => undefined);
}

export function recordEnding(endingId: EndingId) {
  if (typeof window === "undefined") return Promise.resolve();

  return postReportEvent({
    type: "ending",
    playerId: getPlayerId(),
    endingId,
  })
    .then(() => {
      window.dispatchEvent(new Event("game:report-updated"));
    })
    .catch(() => undefined);
}

export async function fetchReportData(signal?: AbortSignal) {
  const response = await fetch("/api/report", {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to load report");
  }

  return (await response.json()) as ReportData;
}
