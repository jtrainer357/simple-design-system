/**
 * Voice System Type Definitions
 *
 * @module voice/types
 */

export interface AppRouter {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  forward: () => void;
}

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

export interface VoiceStoreState {
  // Core state
  state: VoiceState;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;

  // Transcript state
  transcript: string;
  interimTranscript: string;
  lastCommand: string;
  lastResponse: string;

  // Feature flags
  isSupported: boolean;
  ttsAvailable: boolean;

  // Appointment context (for voice commands)
  selectedAppointmentId: string | null;
}

export interface VoiceStoreActions {
  // Lifecycle
  initialize: () => void;

  // Voice control
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;

  // State updates
  setTranscript: (transcript: string, isFinal: boolean) => void;
  setProcessing: (processing: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setLastCommand: (command: string) => void;
  setLastResponse: (response: string) => void;

  // Appointment context
  setSelectedAppointmentId: (id: string | null) => void;

  // TTS
  speak: (text: string) => Promise<void>;
}

export type VoiceStore = VoiceStoreState & VoiceStoreActions;
