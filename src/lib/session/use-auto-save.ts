/**
 * Auto-Save Hook for Clinical Documentation
 * @module session/use-auto-save
 */

import { useState, useCallback, useRef, useEffect } from "react";

export type AutoSaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  debounceDelay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  error: string | null;
  saveNow: () => Promise<void>;
  markChanged: () => void;
  reset: () => void;
}

export function useAutoSave<T>({
  data,
  onSave,
  interval = 30000,
  debounceDelay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dataRef = useRef<T>(data);
  const hasChangesRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const performSave = useCallback(async () => {
    if (isSavingRef.current || !hasChangesRef.current) return;

    isSavingRef.current = true;
    setStatus("saving");
    setError(null);

    try {
      await onSave(dataRef.current);
      hasChangesRef.current = false;
      setLastSavedAt(new Date());
      setStatus("saved");

      setTimeout(() => {
        setStatus((current) => (current === "saved" ? "idle" : current));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setStatus("error");
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  const markChanged = useCallback(() => {
    if (!enabled) return;

    hasChangesRef.current = true;
    setStatus("pending");

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSave();
    }, debounceDelay);
  }, [enabled, debounceDelay, performSave]);

  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    hasChangesRef.current = true;
    await performSave();
  }, [performSave]);

  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
      intervalTimerRef.current = null;
    }
    hasChangesRef.current = false;
    isSavingRef.current = false;
    setStatus("idle");
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    intervalTimerRef.current = setInterval(() => {
      if (hasChangesRef.current && !isSavingRef.current) {
        performSave();
      }
    }, interval);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [enabled, interval, performSave]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hasChangesRef.current && !isSavingRef.current) {
        onSave(dataRef.current).catch(() => {});
      }
    };
  }, [onSave]);

  return {
    status,
    lastSavedAt,
    error,
    saveNow,
    markChanged,
    reset,
  };
}

export function getAutoSaveStatusIndicator(status: AutoSaveStatus): {
  text: string;
  color: string;
  icon: "cloud" | "cloud-upload" | "check" | "alert-circle" | "clock";
} {
  switch (status) {
    case "idle":
      return { text: "Saved", color: "text-muted-foreground", icon: "cloud" };
    case "pending":
      return { text: "Unsaved changes", color: "text-yellow-600", icon: "clock" };
    case "saving":
      return { text: "Saving...", color: "text-blue-600", icon: "cloud-upload" };
    case "saved":
      return { text: "Saved", color: "text-green-600", icon: "check" };
    case "error":
      return { text: "Save failed", color: "text-red-600", icon: "alert-circle" };
  }
}

export default useAutoSave;
