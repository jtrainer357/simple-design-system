/**
 * useEscapeKey Hook
 * Registers an ESC key handler that calls the provided callback
 * Useful for closing modals, exiting full view modes, etc.
 */

import { useEffect, useCallback } from "react";

interface UseEscapeKeyOptions {
  /** Whether the escape handler is currently active */
  enabled?: boolean;
  /** Whether to prevent default behavior */
  preventDefault?: boolean;
  /** Whether to stop propagation */
  stopPropagation?: boolean;
}

/**
 * Hook to handle ESC key press
 * @param callback - Function to call when ESC is pressed
 * @param options - Configuration options
 */
export function useEscapeKey(callback: () => void, options: UseEscapeKeyOptions = {}): void {
  const { enabled = true, preventDefault = true, stopPropagation = false } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && enabled) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback();
      }
    },
    [callback, enabled, preventDefault, stopPropagation]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Hook variant that provides the handler directly
 * Useful when you need more control over when to attach the listener
 */
export function useEscapeKeyHandler(
  callback: () => void,
  options: UseEscapeKeyOptions = {}
): (event: KeyboardEvent) => void {
  const { preventDefault = true, stopPropagation = false, enabled = true } = options;

  return useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && enabled) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback();
      }
    },
    [callback, enabled, preventDefault, stopPropagation]
  );
}

export type { UseEscapeKeyOptions };
