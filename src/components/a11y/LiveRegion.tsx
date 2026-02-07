"use client";

import { useEffect, useRef, useState } from "react";

type Priority = "polite" | "assertive";

interface LiveRegionProps {
  /** The message to announce to screen readers */
  message: string;
  /** Priority level - 'polite' waits for user idle, 'assertive' interrupts */
  priority?: Priority;
  /** Optional className for styling (usually visually hidden) */
  className?: string;
}

/**
 * Announces dynamic content changes to screen readers.
 * Uses ARIA live regions to communicate updates without focus change.
 */
export function LiveRegion({
  message,
  priority = "polite",
  className = "sr-only",
}: LiveRegionProps) {
  const [key, setKey] = useState(0);
  const prevMessageRef = useRef(message);

  useEffect(() => {
    if (message !== prevMessageRef.current) {
      setKey((k) => k + 1);
      prevMessageRef.current = message;
    }
  }, [message]);

  return (
    <div key={key} role="status" aria-live={priority} aria-atomic="true" className={className}>
      {message}
    </div>
  );
}

/**
 * Hook for programmatically announcing messages to screen readers.
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    priority: Priority;
  }>({ message: "", priority: "polite" });

  const announce = (message: string, priority: Priority = "polite") => {
    setAnnouncement({ message, priority });
  };

  return { announce, announcement };
}
