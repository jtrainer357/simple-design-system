/**
 * Session Timer Hook
 * Provides accurate timing for clinical sessions
 * @module session/use-session-timer
 */

import { useState, useCallback, useRef, useEffect } from "react";

interface UseSessionTimerReturn {
  isRunning: boolean;
  isPaused: boolean;
  elapsedSeconds: number;
  elapsedMinutes: number;
  formattedTime: string;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setElapsedTime: (seconds: number) => void;
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function useSessionTimer(
  initialSeconds: number = 0
): UseSessionTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(initialSeconds);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;

    startTimeRef.current = Date.now();
    accumulatedRef.current = elapsedSeconds;
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      setElapsedSeconds(accumulatedRef.current + elapsed);
    }, 1000);
  }, [isRunning, elapsedSeconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    accumulatedRef.current = elapsedSeconds;
    setIsPaused(true);
  }, [isRunning, isPaused, elapsedSeconds]);

  const resume = useCallback(() => {
    if (!isPaused) return;

    startTimeRef.current = Date.now();
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      setElapsedSeconds(accumulatedRef.current + elapsed);
    }, 1000);
  }, [isPaused]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    startTimeRef.current = null;
    accumulatedRef.current = 0;
  }, []);

  const setElapsedTime = useCallback((seconds: number) => {
    setElapsedSeconds(seconds);
    accumulatedRef.current = seconds;
  }, []);

  return {
    isRunning,
    isPaused,
    elapsedSeconds,
    elapsedMinutes: Math.floor(elapsedSeconds / 60),
    formattedTime: formatTime(elapsedSeconds),
    start,
    stop,
    pause,
    resume,
    reset,
    setElapsedTime,
  };
}

export default useSessionTimer;
