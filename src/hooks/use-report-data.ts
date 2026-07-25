"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import {
  fetchReportData,
  getChoicesSnapshot,
  parseChoices,
  subscribeToChoices,
} from "@/lib/report-client";
import type {
  ChoiceMap,
  ReportData,
} from "@/lib/report-types";

export function useReportData(initialData?: ReportData) {
  const [data, setData] = useState<ReportData | undefined>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const choicesSnapshot = useSyncExternalStore(
    subscribeToChoices,
    getChoicesSnapshot,
    () => "{}",
  );
  const choices = useMemo<ChoiceMap>(
    () => parseChoices(choicesSnapshot),
    [choicesSnapshot],
  );

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(false);

    try {
      setData(await fetchReportData(signal));
    } catch (fetchError) {
      if ((fetchError as Error).name !== "AbortError") {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData) return;

    let ignore = false;

    void fetchReportData()
      .then((reportData) => {
        if (ignore) return;
        setData(reportData);
        setError(false);
      })
      .catch(() => {
        if (!ignore) setError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    function refreshAfterUpdate() {
      void refresh();
    }

    window.addEventListener("game:report-updated", refreshAfterUpdate);

    return () => {
      ignore = true;
      window.removeEventListener(
        "game:report-updated",
        refreshAfterUpdate,
      );
    };
  }, [initialData, refresh]);

  return {
    data,
    error,
    choices,
    loading,
    refresh,
  };
}
