"use client";

/**
 * VoiceControl - Mic Button with 4 Visual States
 *
 * States:
 * 1. IDLE - Muted mic icon, no animation
 * 2. LISTENING - Red glow animation, white mic icon
 * 3. PROCESSING - Spinner/loading indicator
 * 4. SPEAKING - Sound wave bars, teal color
 *
 * @module VoiceControl
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2 } from "lucide-react";
import { cn } from "@/design-system/lib/utils";
import { useVoiceStore } from "@/src/lib/voice";
import type { VoiceState } from "@/src/lib/voice";

interface VoiceControlProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Sound wave animation for speaking state
function SoundWave({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-4 items-center justify-center gap-0.5", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-white"
          animate={{
            height: ["8px", "16px", "8px"],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Size configurations
const sizeConfig = {
  sm: { button: "h-8 w-8", icon: "h-4 w-4" },
  md: { button: "h-10 w-10", icon: "h-5 w-5" },
  lg: { button: "h-12 w-12", icon: "h-6 w-6" },
};

// Inner component that handles the actual rendering
function VoiceControlInner({
  className,
  size = "md",
  voiceState,
  isSupported,
}: VoiceControlProps & { voiceState: VoiceState; isSupported: boolean }) {
  const config = sizeConfig[size];

  const isIdle = voiceState === "idle";
  const isListening = voiceState === "listening";
  const isProcessing = voiceState === "processing";
  const isSpeaking = voiceState === "speaking";
  const isActive = isListening || isProcessing || isSpeaking;

  const tooltipText = !isSupported
    ? "Voice commands require Chrome"
    : isIdle
      ? "Click to enable voice commands"
      : isListening
        ? "Listening... say 'Tebra' followed by a command"
        : isProcessing
          ? "Processing..."
          : isSpeaking
            ? "Speaking..."
            : "Voice commands";

  const handleClick = () => {
    if (!isSupported) return;
    useVoiceStore.getState().toggleListening();
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isSupported}
      aria-label={tooltipText}
      aria-pressed={isActive}
      title={tooltipText}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        config.button,
        isIdle && "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        isListening && "bg-[#DC785D] text-white",
        isProcessing && "bg-[#DC785D]/80 text-white",
        isSpeaking && "bg-teal text-white",
        !isSupported && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Outer glow ring - only when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#DC785D]/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.6, 0, 0.6],
            }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </AnimatePresence>

      {/* Inner glow ring - only when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#DC785D]/50"
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            exit={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon container */}
      <span className="relative z-10 flex items-center justify-center">
        {isProcessing ? (
          <Loader2 className={cn(config.icon, "animate-spin")} />
        ) : isSpeaking ? (
          <SoundWave className={config.icon} />
        ) : (
          <Mic className={config.icon} />
        )}
      </span>
    </button>
  );
}

export function VoiceControl({ className, size = "md" }: VoiceControlProps) {
  const config = sizeConfig[size];

  // Use useSyncExternalStore for safe subscription
  const voiceState = React.useSyncExternalStore(
    (callback) => useVoiceStore.subscribe(callback),
    () => useVoiceStore.getState().state,
    () => "idle" as VoiceState // Server snapshot
  );

  const isSupported = React.useSyncExternalStore(
    (callback) => useVoiceStore.subscribe(callback),
    () => useVoiceStore.getState().isSupported,
    () => false // Server snapshot
  );

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useVoiceStore.getState().state;
      if (e.key === "Escape" && state !== "idle") {
        useVoiceStore.getState().toggleListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <VoiceControlInner
      className={className}
      size={size}
      voiceState={voiceState}
      isSupported={isSupported}
    />
  );
}
