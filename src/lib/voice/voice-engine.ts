/**
 * Voice Command Engine using Web Speech API
 *
 * Core engine for the "Hey Tebra" voice-first interface. Provides wake-word
 * detection, natural language command parsing, and confidence-based error
 * handling. Designed for hands-free clinical workflows.
 *
 * Architecture:
 *   Microphone -> Web Speech API -> Transcript -> Wake Word Filter -> Command Matcher -> Action
 *
 * @module voice-engine
 */

// Type definitions for Web Speech API (not included in standard TypeScript)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onspeechend: (() => void) | null;
  onnomatch: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface VoiceCommand {
  id: string;
  patterns: RegExp[];
  handler: (match: RegExpMatchArray, transcript: string) => Promise<string> | string;
  description: string;
}

export interface VoiceEngineCallbacks {
  onListeningChange?: (isListening: boolean) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onCommand?: (commandId: string, response: string) => void;
  onError?: (error: string) => void;
  onNoMatch?: (transcript: string) => void;
}

// Wake word patterns - matches "Tebra" or "Hey Tebra" at the start
// Includes common misheard variations: Debra, Zebra, Tetra, etc.
const WAKE_WORD_PATTERN =
  /^(?:hey\s+)?(?:tebra|debra|zebra|tetra|tab\s?ra|tabra|teabra|tee?brah?|deb\s?ra)\s*,?\s*(.*)/i;

class VoiceEngine {
  private recognition: SpeechRecognitionInstance | null = null;
  private commands: VoiceCommand[] = [];
  private callbacks: VoiceEngineCallbacks = {};
  private isListening = false;
  private shouldRestart = false;
  private isPaused = false; // True when paused for TTS, false otherwise
  private restartTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  constructor() {
    // Don't initialize in constructor - wait for explicit init on client
  }

  /**
   * Ensure the voice engine is initialized (call this on client side)
   */
  ensureInitialized(): void {
    if (!this.initialized && typeof window !== "undefined") {
      this.initializeRecognition();
      this.initialized = true;
    }
  }

  private initializeRecognition(): void {
    const w = window as unknown as Record<string, unknown>;
    const SpeechRecognition = (w.SpeechRecognition || w.webkitSpeechRecognition) as
      | (new () => SpeechRecognitionInstance)
      | undefined;

    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    // Configure for continuous listening with interim results
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Get the latest result
      const resultIndex = event.resultIndex;
      const result = event.results[resultIndex];

      if (!result) return;

      const transcript = result[0]?.transcript.toLowerCase().trim() ?? "";
      const isFinal = result.isFinal;
      const confidence = result[0]?.confidence ?? 0;

      // Debug logging
      console.log(
        "[Voice] Transcript:",
        transcript,
        "| Final:",
        isFinal,
        "| Confidence:",
        confidence
      );

      // Always emit transcript for UI feedback
      this.callbacks.onTranscript?.(transcript, isFinal);

      // Process final results - lowered confidence threshold for better recognition
      if (isFinal) {
        console.log("[Voice] Processing final transcript:", transcript);
        this.processTranscript(transcript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = event.error;

      switch (errorType) {
        case "no-speech":
          // Silent timeout - restart if we should be listening
          if (this.shouldRestart) {
            this.scheduleRestart();
          }
          break;
        case "audio-capture":
          this.callbacks.onError?.("No microphone available");
          this.isListening = false;
          this.callbacks.onListeningChange?.(false);
          break;
        case "not-allowed":
          this.callbacks.onError?.("Microphone permission denied");
          this.isListening = false;
          this.callbacks.onListeningChange?.(false);
          break;
        case "aborted":
          // Intentional stop - no error
          break;
        default:
          console.warn("Speech recognition error:", errorType);
          if (this.shouldRestart) {
            this.scheduleRestart();
          }
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onListeningChange?.(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;

      // Don't notify listeners if we're just paused for TTS
      if (!this.isPaused) {
        this.callbacks.onListeningChange?.(false);
      }

      // Auto-restart if we should still be listening
      if (this.shouldRestart && !this.isPaused) {
        this.scheduleRestart();
      }
    };
  }

  private scheduleRestart(): void {
    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
    }

    this.restartTimeoutId = setTimeout(() => {
      if (this.shouldRestart && this.recognition && !this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          // Already started or other error - ignore
          console.warn("Failed to restart recognition:", e);
        }
      }
    }, 100);
  }

  private async processTranscript(transcript: string): Promise<void> {
    console.log("[Voice] processTranscript called with:", transcript);
    console.log("[Voice] Registered commands:", this.commands.length);

    // Check for wake word
    const wakeMatch = transcript.match(WAKE_WORD_PATTERN);
    console.log("[Voice] Wake word match:", wakeMatch);

    if (!wakeMatch) {
      // No wake word - ignore
      console.log("[Voice] No wake word found, ignoring");
      return;
    }

    // Extract the command part after the wake word
    const commandText = wakeMatch[1]?.trim() ?? "";
    console.log("[Voice] Command text after wake word:", commandText);

    if (!commandText) {
      // Wake word detected but no command
      console.log("[Voice] Wake word detected but no command");
      this.callbacks.onNoMatch?.("Listening... what would you like me to do?");
      return;
    }

    // Try to match against registered commands
    for (const command of this.commands) {
      for (const pattern of command.patterns) {
        const match = commandText.match(pattern);
        if (match) {
          console.log("[Voice] MATCHED command:", command.id, "with pattern:", pattern);
          try {
            const response = await command.handler(match, commandText);
            console.log("[Voice] Command response:", response);
            this.callbacks.onCommand?.(command.id, response);
            return;
          } catch (error) {
            console.error("[Voice] Command handler error:", error);
            this.callbacks.onError?.("Sorry, something went wrong. Please try again.");
            return;
          }
        }
      }
    }

    // No command matched
    console.log("[Voice] No command matched for:", commandText);
    this.callbacks.onNoMatch?.(commandText);
  }

  // Public API
  registerCommand(command: VoiceCommand): void {
    // Remove existing command with same ID
    this.commands = this.commands.filter((c) => c.id !== command.id);
    this.commands.push(command);
  }

  registerCommands(commands: VoiceCommand[]): void {
    console.log("[Voice] Registering", commands.length, "commands");
    commands.forEach((cmd) => this.registerCommand(cmd));
    console.log("[Voice] Total commands now:", this.commands.length);
  }

  clearCommands(): void {
    this.commands = [];
  }

  setCallbacks(callbacks: VoiceEngineCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  start(): boolean {
    // Ensure initialized before checking recognition
    this.ensureInitialized();

    if (!this.recognition) {
      this.callbacks.onError?.("Voice commands require Chrome browser");
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    this.shouldRestart = true;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Failed to start recognition:", error);
      return false;
    }
  }

  stop(): void {
    this.shouldRestart = false;
    this.isPaused = false;

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
      this.restartTimeoutId = null;
    }

    if (this.recognition) {
      try {
        // Use abort() for immediate stop, more reliable than stop()
        this.recognition.abort();
      } catch {
        // Ignore errors if already stopped
      }
      this.isListening = false;
    }
  }

  /**
   * Temporarily pause listening (e.g., while TTS is playing)
   * Call resume() to continue
   */
  pause(): void {
    this.isPaused = true;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Resume listening after a pause
   */
  resume(): void {
    this.isPaused = false;
    // Always try to restart after resume
    if (!this.isListening && this.recognition) {
      this.shouldRestart = true;
      this.scheduleRestart();
    }
  }

  isSupported(): boolean {
    this.ensureInitialized();
    return this.recognition !== null;
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Export singleton instance
export const voiceEngine = new VoiceEngine();

// Also export class for testing
export { VoiceEngine };
