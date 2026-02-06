/**
 * Voice System Module
 *
 * Exports all voice-related functionality including the voice engine,
 * command registry, event bus, and types.
 *
 * @module voice
 */

export { voiceEngine, VoiceEngine } from "./voice-engine";
export type { VoiceCommand, VoiceEngineOptions } from "./voice-engine";

export { createCommands, FALLBACK_RESPONSE } from "./command-registry";

export { voiceEvents } from "./voice-events";
export type { VoiceEventType, VoiceEvent } from "./voice-events";
