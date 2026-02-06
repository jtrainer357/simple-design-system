/**
 * Voice System Module
 *
 * Exports all voice-related functionality including the voice engine,
 * command registry, state management, and types.
 *
 * @module voice
 */

export { voiceEngine, VoiceEngine } from "./voice-engine";
export type { VoiceCommand, VoiceEngineCallbacks } from "./voice-engine";

export { createCommandRegistry, FALLBACK_RESPONSE } from "./command-registry";
export type { CommandDependencies } from "./command-registry";

export { useVoiceStore } from "./voice-store";

export type {
  AppRouter,
  VoiceState,
  VoiceStore,
  VoiceStoreState,
  VoiceStoreActions,
} from "./types";
