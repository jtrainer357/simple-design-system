/**
 * Speech Recognition Platform Abstraction
 *
 * Provides a unified interface for speech recognition across platforms:
 * - Web: Uses Web Speech API (wrapped from existing voice-engine)
 * - Native: Uses @capacitor-community/speech-recognition
 *
 * @module platform/speech
 */

import { SpeechRecognition as CapacitorSpeechRecognition } from "@capacitor-community/speech-recognition";
import { isNative, isWeb } from "./index";
import type { SpeechRecognitionOptions } from "./types";

/**
 * Unified speech engine interface
 */
export interface SpeechEngine {
  /** Check if speech recognition is supported on this platform */
  isSupported(): boolean;

  /** Request microphone permissions */
  requestPermission(): Promise<boolean>;

  /** Start speech recognition */
  start(options?: SpeechRecognitionOptions): Promise<void>;

  /** Stop speech recognition */
  stop(): void;

  /** Register transcript callback */
  onTranscript(callback: (text: string, isFinal: boolean) => void): void;

  /** Register error callback */
  onError(callback: (error: Error) => void): void;

  /** Clean up resources */
  destroy(): void;
}

// Web Speech API type definitions (before class that uses them)
interface WebSpeechRecognitionEvent {
  results: WebSpeechRecognitionResultList;
  resultIndex: number;
}

interface WebSpeechRecognitionResultList {
  length: number;
  [index: number]: WebSpeechRecognitionResult;
}

interface WebSpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: WebSpeechRecognitionAlternative;
}

interface WebSpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface WebSpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

// Web Speech API instance interface
interface WebSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/**
 * Web Speech API implementation
 * Wraps the browser's native Web Speech API
 */
class WebSpeechEngine implements SpeechEngine {
  private recognition: WebSpeechRecognitionInstance | null = null;
  private transcriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private isInitialized = false;

  // Type definition for Web Speech API constructor
  private SpeechRecognitionClass: (new () => WebSpeechRecognitionInstance) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const w = window as unknown as Record<string, unknown>;
      this.SpeechRecognitionClass = (w.SpeechRecognition || w.webkitSpeechRecognition) as
        | (new () => WebSpeechRecognitionInstance)
        | null;
    }
  }

  private initialize(): void {
    if (this.isInitialized || !this.SpeechRecognitionClass) return;

    this.recognition = new this.SpeechRecognitionClass();
    this.setupRecognition();
    this.isInitialized = true;
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: WebSpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (result) {
        const transcript = result[0]?.transcript || "";
        const isFinal = result.isFinal;
        this.transcriptCallback?.(transcript.trim(), isFinal);
      }
    };

    this.recognition.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        "no-speech": "No speech detected",
        "audio-capture": "No microphone available",
        "not-allowed": "Microphone permission denied",
        aborted: "Speech recognition aborted",
        network: "Network error during recognition",
      };
      const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      this.errorCallback?.(new Error(message));
    };
  }

  isSupported(): boolean {
    return this.SpeechRecognitionClass !== null;
  }

  async requestPermission(): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed to request permission
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }

  async start(options?: SpeechRecognitionOptions): Promise<void> {
    this.initialize();

    if (!this.recognition) {
      throw new Error("Speech recognition not supported");
    }

    if (options?.language) {
      this.recognition.lang = options.language;
    }
    if (options?.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    if (options?.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }

    try {
      this.recognition.start();
    } catch (error) {
      // May throw if already started
      if ((error as Error).message?.includes("already started")) {
        // Ignore - already listening
      } else {
        throw error;
      }
    }
  }

  stop(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore errors on stop
      }
    }
  }

  onTranscript(callback: (text: string, isFinal: boolean) => void): void {
    this.transcriptCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  destroy(): void {
    this.stop();
    this.recognition = null;
    this.transcriptCallback = null;
    this.errorCallback = null;
    this.isInitialized = false;
  }
}

/**
 * Native speech recognition implementation using Capacitor
 */
class NativeSpeechEngine implements SpeechEngine {
  private transcriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private isListening = false;
  private listenerHandle: { remove: () => Promise<void> } | null = null;

  isSupported(): boolean {
    return true; // Always supported on native with the plugin
  }

  async requestPermission(): Promise<boolean> {
    try {
      const { speechRecognition } = await CapacitorSpeechRecognition.requestPermissions();
      return speechRecognition === "granted";
    } catch {
      return false;
    }
  }

  async start(options?: SpeechRecognitionOptions): Promise<void> {
    if (this.isListening) {
      return;
    }

    // Check permissions first
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        throw new Error("Speech recognition permission denied");
      }
    }

    // Set up listener for results
    this.listenerHandle = await CapacitorSpeechRecognition.addListener(
      "partialResults",
      (data: { matches?: string[] }) => {
        if (data.matches && data.matches.length > 0) {
          // Capacitor plugin returns matches array
          const transcript = data.matches[0] || "";
          // partialResults are interim, listeningState change indicates final
          this.transcriptCallback?.(transcript, false);
        }
      }
    );

    try {
      await CapacitorSpeechRecognition.start({
        language: options?.language || "en-US",
        partialResults: options?.interimResults ?? true,
        popup: false, // Don't show native popup on Android
      });
      this.isListening = true;
    } catch (error) {
      this.errorCallback?.(error as Error);
      throw error;
    }
  }

  private async checkPermission(): Promise<boolean> {
    try {
      const { speechRecognition } = await CapacitorSpeechRecognition.checkPermissions();
      return speechRecognition === "granted";
    } catch {
      return false;
    }
  }

  stop(): void {
    if (this.isListening) {
      CapacitorSpeechRecognition.stop().catch(() => {
        // Ignore errors on stop
      });
      this.isListening = false;
    }

    if (this.listenerHandle) {
      this.listenerHandle.remove().catch(() => {
        // Ignore cleanup errors
      });
      this.listenerHandle = null;
    }
  }

  onTranscript(callback: (text: string, isFinal: boolean) => void): void {
    this.transcriptCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  destroy(): void {
    this.stop();
    this.transcriptCallback = null;
    this.errorCallback = null;
  }
}

/**
 * Factory function to create the appropriate speech engine for the current platform
 */
export function createSpeechEngine(): SpeechEngine {
  if (isNative()) {
    return new NativeSpeechEngine();
  }

  if (isWeb()) {
    return new WebSpeechEngine();
  }

  // Fallback to web
  return new WebSpeechEngine();
}

// Export classes for testing
export { WebSpeechEngine, NativeSpeechEngine };
