/**
 * Platform Types for Cross-Platform Abstraction
 *
 * Type definitions for platform detection and capability checking
 * across web, iOS, and Android platforms.
 *
 * @module platform/types
 */

/**
 * Supported platform identifiers
 */
export type Platform = "web" | "ios" | "android";

/**
 * Platform-specific capabilities
 */
export interface PlatformCapabilities {
  /** Native push notifications supported */
  pushNotifications: boolean;
  /** Haptic feedback available */
  haptics: boolean;
  /** Biometric authentication (Face ID, Touch ID, fingerprint) */
  biometrics: boolean;
  /** Secure keychain/keystore storage */
  secureStorage: boolean;
  /** Native speech recognition */
  nativeSpeechRecognition: boolean;
  /** Web Speech API */
  webSpeechRecognition: boolean;
  /** Background audio */
  backgroundAudio: boolean;
  /** Camera access */
  camera: boolean;
  /** Local notifications */
  localNotifications: boolean;
}

/**
 * Speech recognition options
 */
export interface SpeechRecognitionOptions {
  /** Language code (e.g., 'en-US') */
  language?: string;
  /** Enable continuous recognition */
  continuous?: boolean;
  /** Return interim results */
  interimResults?: boolean;
  /** Maximum alternatives to return */
  maxAlternatives?: number;
}

/**
 * Speech recognition result
 */
export interface SpeechTranscript {
  /** Recognized text */
  text: string;
  /** Whether this is a final result */
  isFinal: boolean;
  /** Confidence score (0-1) */
  confidence?: number;
}

/**
 * Notification options for scheduling
 */
export interface NotificationOptions {
  /** Unique identifier */
  id?: string;
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** When to show (for scheduled notifications) */
  scheduledAt?: Date;
  /** Additional data payload */
  data?: Record<string, unknown>;
  /** Badge count (iOS) */
  badge?: number;
  /** Sound to play */
  sound?: string;
}

/**
 * Haptic feedback intensity
 */
export type HapticStyle = "light" | "medium" | "heavy";

/**
 * Haptic feedback type
 */
export type HapticType = "impact" | "notification" | "selection";

/**
 * Biometric authentication result
 */
export interface BiometricResult {
  /** Authentication succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Type of biometric used */
  type?: "faceId" | "touchId" | "fingerprint" | "iris";
}

/**
 * Secure storage item
 */
export interface SecureStorageItem {
  key: string;
  value: string;
}
