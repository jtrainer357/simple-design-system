"use client";

/**
 * VoiceControl - Mic Button with 2 Visual States
 *
 * States:
 * 1. OFF (idle) - Transparent bg, primary (coral) mic icon
 * 2. ON (listening) - Primary (coral) bg with pulse, white mic icon
 *
 * @module VoiceControl
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { voiceEngine } from "@/src/lib/voice/voice-engine";

interface VoiceControlProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  onTranscriptChange?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

// Size configurations - bigger icons with heavier stroke
const sizeConfig = {
  sm: { button: "h-8 w-8", icon: "h-5 w-5", strokeWidth: 2.5 },
  md: { button: "h-10 w-10", icon: "h-6 w-6", strokeWidth: 2.5 },
  lg: { button: "h-12 w-12", icon: "h-7 w-7", strokeWidth: 2.5 },
};

export function VoiceControl({
  className,
  size = "md",
  onTranscriptChange,
  onListeningChange: onListeningChangeProp,
}: VoiceControlProps) {
  const config = sizeConfig[size];
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");

  // Check if supported (client-side only)
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    setIsSupported(voiceEngine.isSupported());

    // Restore listening state if user had it activated (survives navigation)
    if (voiceEngine.isUserActivated()) {
      setIsListening(true);
    }
  }, []);

  // Notify parent of transcript changes
  React.useEffect(() => {
    onTranscriptChange?.(transcript);
  }, [transcript, onTranscriptChange]);

  // Notify parent of listening state changes
  React.useEffect(() => {
    onListeningChangeProp?.(isListening);
  }, [isListening, onListeningChangeProp]);

  // Toggle voice listening
  const handleToggle = React.useCallback(() => {
    if (!isSupported) return;

    if (isListening) {
      voiceEngine.stop();
      setIsListening(false);
      setTranscript("");
    } else {
      const started = voiceEngine.start({
        onTranscript: (text: string) => {
          setTranscript(text);
        },
      });
      if (started) {
        setIsListening(true);
      }
    }
  }, [isListening, isSupported]);

  // Handle escape key to stop listening
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isListening) {
        voiceEngine.stop();
        setIsListening(false);
        setTranscript("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening]);

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const tooltipText = isListening
    ? "Listening... say 'Tebra' followed by a command"
    : "Click to enable voice commands";

  return (
    <div className={cn("relative", className)}>
      {/* The button — 2 states only: OFF (idle) and ON (listening) */}
      <button
        onClick={handleToggle}
        aria-label={tooltipText}
        aria-pressed={isListening}
        title={tooltipText}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200",
          "cursor-pointer border-none outline-none",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          config.button,
          isListening ? "bg-[var(--color-primary)] shadow-md" : "bg-transparent hover:bg-black/5"
        )}
      >
        <Mic
          className={cn(config.icon, isListening ? "text-white" : "text-[var(--color-primary)]")}
          strokeWidth={config.strokeWidth}
        />
      </button>

      {/* Subtle pulse ring — only when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-[var(--color-primary)]/40"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
