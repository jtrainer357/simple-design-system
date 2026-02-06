"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/design-system/components/ui/input";
import { Heading } from "@/design-system/components/ui/typography";
import { VoiceControl } from "@/src/components/voice";
import { useVoiceStore } from "@/src/lib/voice";
import type { VoiceState } from "@/src/lib/voice";
import { cn } from "@/design-system/lib/utils";

function VoiceTranscriptInline() {
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

  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";
  const isProcessing = voiceState === "processing";
  const isActive = isListening || isProcessing || isSpeaking;

  // Determine what text to show
  const displayText = React.useMemo(() => {
    if (isSpeaking && lastResponse) {
      return lastResponse;
    }
    if (interimTranscript) {
      return interimTranscript;
    }
    if (transcript) {
      return transcript;
    }
    return "";
  }, [transcript, interimTranscript, lastResponse, isSpeaking]);

  if (!isActive || !displayText) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center rounded-full px-10 pr-12",
        isSpeaking ? "bg-teal/10" : "bg-white"
      )}
    >
      <p className="truncate text-sm">
        {isSpeaking ? (
          <span className="flex items-center gap-1.5">
            <span className="text-teal text-xs font-medium">Tebra:</span>
            <span className="text-foreground">{displayText}</span>
          </span>
        ) : (
          <span className="text-foreground">{displayText}</span>
        )}
      </p>
    </div>
  );
}

export function HeaderSearch() {
  return (
    <header className="w-full shrink-0 px-4 pt-[18px] pb-4 sm:px-6">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Title - responsive sizing */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Heading level={4} className="truncate text-base sm:text-lg md:text-xl">
            Riverside Family Health & Wellness
          </Heading>
        </div>

        {/* Search bar with voice control inside */}
        <div className="relative w-full sm:max-w-md md:max-w-xl lg:max-w-2xl">
          <div className="text-muted-foreground absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-1">
            <Sparkles className="h-4 w-4" />
          </div>
          <Input
            className="focus-visible:ring-primary/20 h-10 w-full rounded-full border-none bg-white pr-12 pl-10 text-sm ring-1 ring-black/5 focus-visible:ring-2"
            placeholder="Ask me anything..."
          />
          {/* Voice transcript overlay - shows inside the input */}
          <VoiceTranscriptInline />
          {/* Voice Control Button - inside search field */}
          <div className="absolute top-1/2 right-1 z-10 -translate-y-1/2">
            <VoiceControl size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
}
