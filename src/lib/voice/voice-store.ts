/**
 * Voice State Management with Zustand
 *
 * Manages the global voice command state including listening status,
 * transcripts, and TTS playback.
 *
 * @module voice-store
 */

import { create } from "zustand";
import type { VoiceStore, VoiceState } from "./types";
import { voiceEngine } from "./voice-engine";

// TTS API endpoint (uses OpenAI if available, falls back to browser)
const TTS_ENDPOINT = "/api/tts";

/**
 * Browser-based TTS fallback using Web Speech Synthesis
 */
async function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Google") ||
        v.name.includes("Microsoft") ||
        v.name.includes("Karen") ||
        v.name.includes("Alex")
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speak using OpenAI TTS API with browser fallback
 */
async function speakWithOpenAI(text: string): Promise<void> {
  try {
    const response = await fetch(TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: "nova" }),
    });

    if (!response.ok) {
      // Fall back to browser TTS
      return speakWithBrowser(text);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        // Fall back to browser TTS on error
        speakWithBrowser(text).then(resolve);
      };
      audio.play().catch(() => {
        // Autoplay blocked - fall back to browser TTS
        speakWithBrowser(text).then(resolve);
      });
    });
  } catch {
    // Network error - fall back to browser TTS
    return speakWithBrowser(text);
  }
}

/**
 * Calculate voice state based on flags
 */
function calculateState(
  isListening: boolean,
  isProcessing: boolean,
  isSpeaking: boolean
): VoiceState {
  if (isSpeaking) return "speaking";
  if (isProcessing) return "processing";
  if (isListening) return "listening";
  return "idle";
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  // Initial state
  state: "idle",
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  transcript: "",
  interimTranscript: "",
  lastCommand: "",
  lastResponse: "",
  isSupported: false,
  ttsAvailable: true,
  selectedAppointmentId: null,

  // Initialize the voice system
  initialize: () => {
    const isSupported = voiceEngine.isSupported();
    set({ isSupported });

    // Load voices for browser TTS fallback
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Voices are loaded asynchronously in some browsers
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  },

  // Toggle listening on/off
  toggleListening: () => {
    // Check both store state AND engine state to be safe
    const storeListening = get().isListening;
    const engineListening = voiceEngine.getIsListening();

    if (storeListening || engineListening) {
      get().stopListening();
    } else {
      get().startListening();
    }
  },

  // Start listening
  startListening: () => {
    const success = voiceEngine.start();
    if (success) {
      set({
        isListening: true,
        state: "listening",
        transcript: "",
        interimTranscript: "",
      });
    }
  },

  // Stop listening
  stopListening: () => {
    voiceEngine.stop();
    // Force reset all voice-related state
    set({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      state: "idle",
      transcript: "",
      interimTranscript: "",
    });
  },

  // Update transcript
  setTranscript: (transcript: string, isFinal: boolean) => {
    if (isFinal) {
      set({ transcript, interimTranscript: "" });
    } else {
      set({ interimTranscript: transcript });
    }
  },

  // Set processing state
  setProcessing: (processing: boolean) => {
    const { isListening, isSpeaking } = get();
    set({
      isProcessing: processing,
      state: calculateState(isListening, processing, isSpeaking),
    });
  },

  // Set speaking state
  setSpeaking: (speaking: boolean) => {
    const { isListening, isProcessing } = get();
    set({
      isSpeaking: speaking,
      state: calculateState(isListening, isProcessing, speaking),
    });
  },

  // Set last command
  setLastCommand: (command: string) => {
    set({ lastCommand: command });
  },

  // Set last response
  setLastResponse: (response: string) => {
    set({ lastResponse: response });
  },

  // Set selected appointment
  setSelectedAppointmentId: (id: string | null) => {
    set({ selectedAppointmentId: id });
  },

  // Speak response
  speak: async (text: string) => {
    // Pause listening while speaking to avoid echo
    voiceEngine.pause();

    set({
      isSpeaking: true,
      lastResponse: text,
      state: "speaking",
    });

    try {
      await speakWithOpenAI(text);
    } finally {
      set({
        isSpeaking: false,
        isListening: true,
        state: "listening",
      });

      // Always resume listening after speaking - this is the expected behavior
      // for a voice-first interface
      voiceEngine.resume();
    }
  },
}));
