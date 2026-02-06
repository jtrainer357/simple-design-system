"use client";

/**
 * VoiceTranscript - Floating Transcript Pill
 *
 * Shows real-time speech-to-text as the user speaks.
 * Displays interim results with a typing effect, then shows
 * the final transcript before fading away.
 *
 * @module VoiceTranscript
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/design-system/lib/utils";
import { useVoiceStore } from "@/src/lib/voice";
import type { VoiceState } from "@/src/lib/voice";

interface VoiceTranscriptProps {
  className?: string;
}

export function VoiceTranscript({ className }: VoiceTranscriptProps) {
  // Use useSyncExternalStore for safe subscription
  const voiceState = React.useSyncExternalStore(
    (callback) => useVoiceStore.subscribe(callback),
    () => useVoiceStore.getState().state,
    () => "idle" as VoiceState
  );

  const transcript = React.useSyncExternalStore(
    (callback) => useVoiceStore.subscribe(callback),
    () => useVoiceStore.getState().transcript,
    () => ""
  );

  const interimTranscript = React.useSyncExternalStore(
    (callback) => useVoiceStore.subscribe(callback),
    () => useVoiceStore.getState().interimTranscript,
    () => ""
  );

  const lastResponse = React.useSyncExternalStore(
    (callback) => useVoiceStore.subscribe(callback),
    () => useVoiceStore.getState().lastResponse,
    () => ""
  );

  const [displayText, setDisplayText] = React.useState("");
  const [showResponse, setShowResponse] = React.useState(false);
  const hideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";
  const isProcessing = voiceState === "processing";

  // Determine what text to show
  React.useEffect(() => {
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (isSpeaking && lastResponse) {
      // Show the AI response while speaking
      setDisplayText(lastResponse);
      setShowResponse(true);
    } else if (interimTranscript) {
      // Show interim transcript while user is speaking
      setDisplayText(interimTranscript);
      setShowResponse(false);
    } else if (transcript) {
      // Show final transcript briefly
      setDisplayText(transcript);
      setShowResponse(false);

      // Hide after 2 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setDisplayText("");
      }, 2000);
    } else {
      setDisplayText("");
      setShowResponse(false);
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [transcript, interimTranscript, lastResponse, isSpeaking]);

  // Only show when we have text to display and are in an active state
  const isVisible = Boolean(displayText) && (isListening || isProcessing || isSpeaking);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "fixed top-20 left-1/2 z-50 -translate-x-1/2",
            "max-w-[90vw] sm:max-w-md",
            className
          )}
        >
          <div
            className={cn(
              "rounded-full px-5 py-2.5 shadow-lg backdrop-blur-sm",
              "border transition-colors duration-200",
              showResponse
                ? "border-teal/30 bg-teal/95 text-white"
                : "border-border bg-card/95 text-foreground"
            )}
          >
            <p className="text-sm font-medium">
              {showResponse ? (
                <span className="flex items-center gap-2">
                  <span className="shrink-0 text-xs opacity-80">Tebra:</span>
                  <span className="truncate">{displayText}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground shrink-0 text-xs">You:</span>
                  <span className="truncate">
                    {displayText}
                    {interimTranscript && (
                      <motion.span
                        className="ml-0.5 inline-block h-3 w-0.5 bg-current"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </span>
                </span>
              )}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
