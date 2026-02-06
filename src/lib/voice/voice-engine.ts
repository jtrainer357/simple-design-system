/**
 * Voice Command Engine using Web Speech API
 *
 * Core engine for the "Hey Tebra" voice-first interface. Provides wake-word
 * detection, natural language command parsing, and continuous listening.
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

/**
 * Voice command with regex patterns and action handler
 */
export interface VoiceCommand {
  id: string;
  patterns: RegExp[];
  /** Action receives the regex match array and original transcript. Return false to pass to next command. */
  action: (match: RegExpMatchArray, transcript: string) => boolean | void;
  /** Lower priority = checked first. Default 10. */
  priority?: number;
  description?: string;
}

export interface VoiceEngineOptions {
  onTranscript?: (text: string, hadWakeWord: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
  onError?: (error: string) => void;
}

// Wake word patterns - matches "Tebra" or "Hey Tebra" at the start
// Includes common misheard variations: Debra, Zebra, Tetra, etc.
const WAKE_WORD_PATTERN =
  /^(?:hey\s+)?(?:tebra|debra|zebra|tetra|tab\s?ra|tabra|teabra|tee?brah?|deb\s?ra)[,.]?\s*(.*)/i;

class VoiceEngine {
  private recognition: SpeechRecognitionInstance | null = null;
  private commands: VoiceCommand[] = [];
  private options: VoiceEngineOptions = {};
  private isListening = false;
  private shouldRestart = false;
  private isPaused = false;
  private restartTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;
  // Track when wake word was last heard (for split phrase detection)
  private lastWakeWordTime: number = 0;
  private static WAKE_WORD_WINDOW_MS = 5000; // 5 second window after wake word
  // Track if user has activated listening (survives component remounts)
  private userActivated = false;

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
      console.warn("[Voice] Web Speech API not supported in this browser");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    // Configure for continuous listening - stays on until user toggles off
    this.recognition.continuous = true;
    this.recognition.interimResults = false; // Only fire on final results
    this.recognition.lang = "en-US";
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Get the LATEST final result only
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult || !lastResult.isFinal) return;

      const transcript = lastResult[0]?.transcript.toLowerCase().trim() ?? "";
      const confidence = lastResult[0]?.confidence ?? 0;

      console.log("[Voice] Transcript:", transcript, "| Confidence:", confidence);

      // Accept anything above 0.5 - Web Speech API on Chrome is conservative
      if (confidence < 0.5) {
        console.log("[Voice] Confidence too low, ignoring");
        return;
      }

      // Check for wake word
      const wakeMatch = transcript.match(WAKE_WORD_PATTERN);
      const commandText = wakeMatch ? (wakeMatch[1]?.trim() ?? "") : "";
      const now = Date.now();
      const isWithinWakeWindow = now - this.lastWakeWordTime < VoiceEngine.WAKE_WORD_WINDOW_MS;

      console.log("[Voice] Wake word match:", !!wakeMatch, "| Command text:", commandText);
      console.log(
        "[Voice] Within wake window:",
        isWithinWakeWindow,
        "| Registered commands:",
        this.commands.length
      );

      // Case 1: Wake word + command in same phrase
      if (wakeMatch && commandText) {
        this.lastWakeWordTime = 0; // Reset window
        const matched = this.executeCommand(commandText, transcript);
        console.log("[Voice] Command executed:", matched);
      }
      // Case 2: Wake word only (no command) - start listening window
      else if (wakeMatch && !commandText) {
        this.lastWakeWordTime = now;
        console.log("[Voice] Wake word detected, waiting for command...");
      }
      // Case 3: No wake word but within window - treat entire transcript as command
      else if (!wakeMatch && isWithinWakeWindow && transcript) {
        this.lastWakeWordTime = 0; // Reset window
        console.log("[Voice] Processing command from wake window:", transcript);
        const matched = this.executeCommand(transcript, transcript);
        console.log("[Voice] Command executed:", matched);
      }

      // Fire transcript callback
      this.options.onTranscript?.(transcript, !!wakeMatch || isWithinWakeWindow);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = event.error;

      switch (errorType) {
        case "no-speech":
          // Silent timeout - restart if we should be listening
          if (this.shouldRestart && !this.isPaused) {
            this.scheduleRestart();
          }
          break;
        case "audio-capture":
          this.options.onError?.("No microphone available");
          this.isListening = false;
          this.options.onListeningChange?.(false);
          break;
        case "not-allowed":
          this.options.onError?.("Microphone permission denied");
          this.isListening = false;
          this.options.onListeningChange?.(false);
          break;
        case "aborted":
          // Intentional stop - no error
          break;
        default:
          console.warn("[Voice] Speech recognition error:", errorType);
          if (this.shouldRestart && !this.isPaused) {
            this.scheduleRestart();
          }
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.options.onListeningChange?.(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;

      // Auto-restart if we should still be listening
      if (this.shouldRestart && !this.isPaused) {
        this.scheduleRestart();
        // Don't notify listeners - we're restarting, not stopping
        return;
      }

      // Only notify listeners if we're actually stopping
      if (!this.isPaused) {
        this.options.onListeningChange?.(false);
      }
    };
  }

  private scheduleRestart(): void {
    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
    }

    this.restartTimeoutId = setTimeout(() => {
      if (this.shouldRestart && this.recognition && !this.isListening && !this.isPaused) {
        try {
          this.recognition.start();
        } catch {
          // Already started or other error - ignore
        }
      }
    }, 100);
  }

  /**
   * Execute a command against the registered commands
   * Commands are sorted by priority (lower = first)
   */
  private executeCommand(commandText: string, originalTranscript: string): boolean {
    // Sort commands by priority (ascending - lower priority value = checked first)
    const sortedCommands = [...this.commands].sort(
      (a, b) => (a.priority ?? 10) - (b.priority ?? 10)
    );

    console.log("[Voice] Trying to match command:", commandText);

    for (const command of sortedCommands) {
      for (const pattern of command.patterns) {
        const match = commandText.match(pattern);
        if (match) {
          console.log("[Voice] MATCHED command:", command.id, "| Pattern:", pattern.toString());
          try {
            // Pass the full match array and original transcript to the action
            // If action returns false, continue to next command (not handled)
            const result = command.action(match, originalTranscript);
            if (result === false) {
              console.log("[Voice] Command", command.id, "declined to handle, trying next...");
              break; // Break inner loop, continue to next command
            }
            return true;
          } catch (error) {
            console.error("[Voice] Command handler error:", error);
            return false;
          }
        }
      }
    }

    console.log("[Voice] No command matched for:", commandText);
    // No match found - that's okay, user might just be talking
    return false;
  }

  // Public API

  /**
   * Register a voice command
   */
  registerCommand(command: VoiceCommand): void {
    // Remove existing command with same ID
    this.commands = this.commands.filter((c) => c.id !== command.id);
    this.commands.push(command);
  }

  /**
   * Register multiple voice commands
   */
  registerCommands(commands: VoiceCommand[]): void {
    commands.forEach((cmd) => this.registerCommand(cmd));
  }

  /**
   * Clear all registered commands
   */
  clearCommands(): void {
    this.commands = [];
  }

  /**
   * Start listening for voice commands
   */
  start(options?: VoiceEngineOptions): boolean {
    this.ensureInitialized();

    if (!this.recognition) {
      options?.onError?.("Voice commands require Chrome browser");
      return false;
    }

    if (this.isListening) {
      return true; // Already listening
    }

    // Store options for callbacks
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.shouldRestart = true;
    this.isPaused = false;
    this.userActivated = true; // Track that user turned on listening

    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Stop listening for voice commands
   */
  stop(): void {
    this.shouldRestart = false;
    this.isPaused = false;
    this.userActivated = false; // Track that user turned off listening

    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
      this.restartTimeoutId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore errors if already stopped
      }
      this.isListening = false;
      this.options.onListeningChange?.(false);
    }
  }

  /**
   * Toggle listening on/off
   * @returns The new isListening state
   */
  toggle(options?: VoiceEngineOptions): boolean {
    if (this.isListening || this.shouldRestart) {
      this.stop();
      return false;
    } else {
      this.start(options);
      return true;
    }
  }

  /**
   * Temporarily pause listening (e.g., while TTS is playing)
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
    if (!this.isListening && this.recognition && this.shouldRestart) {
      this.scheduleRestart();
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  isSupported(): boolean {
    this.ensureInitialized();
    return this.recognition !== null;
  }

  /**
   * Get current listening state
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Check if user has activated listening (survives component remounts)
   */
  isUserActivated(): boolean {
    return this.userActivated;
  }
}

// Export singleton instance
export const voiceEngine = new VoiceEngine();

// Also export class for testing
export { VoiceEngine };
