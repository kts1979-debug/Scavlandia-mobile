// src/hooks/useHuntTimer.ts
// Manages the hunt countdown timer.
// Import in ActiveHuntScreen: import { useHuntTimer } from '../hooks/useHuntTimer'

import { useCallback, useEffect, useRef, useState } from "react";

export function useHuntTimer(initialMinutes: number, onExpire: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsExpired(true);
          setIsRunning(false);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning, onExpire]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current!);
  }, []);

  // Format seconds into MM:SS display
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Warning states
  const isWarning = secondsLeft <= 300 && secondsLeft > 60; // Under 5 min
  const isCritical = secondsLeft <= 60; // Under 1 min

  return {
    secondsLeft,
    display,
    isRunning,
    isExpired,
    isWarning,
    isCritical,
    pause,
    resume,
    stop,
  };
}
