/**
 * Platform Detection Utility
 *
 * Detects the current runtime platform (web, iOS, Android) using Capacitor.
 * Provides utilities for platform-specific feature detection.
 *
 * @module platform
 */

import { Capacitor } from "@capacitor/core";
import type { Platform, PlatformCapabilities } from "./types";

/**
 * Check if running on a native platform (iOS or Android)
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android";
}

/**
 * Check if running on web
 */
export function isWeb(): boolean {
  return Capacitor.getPlatform() === "web";
}

/**
 * Get the current platform identifier
 */
export function getPlatform(): Platform {
  const platform = Capacitor.getPlatform();
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  return "web";
}

/**
 * Check if a specific Capacitor plugin is available
 */
export function isPluginAvailable(pluginName: string): boolean {
  return Capacitor.isPluginAvailable(pluginName);
}

/**
 * Get platform capabilities
 */
export function getPlatformCapabilities(): PlatformCapabilities {
  const native = isNative();
  const ios = isIOS();
  const android = isAndroid();

  // Check for Web Speech API support
  const hasWebSpeech =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  return {
    pushNotifications: native && isPluginAvailable("PushNotifications"),
    haptics: native && isPluginAvailable("Haptics"),
    biometrics: native, // Native biometrics available on both iOS and Android
    secureStorage: native, // Keychain (iOS) / KeyStore (Android)
    nativeSpeechRecognition: native && isPluginAvailable("SpeechRecognition"),
    webSpeechRecognition: hasWebSpeech,
    backgroundAudio: ios || android,
    camera: native && isPluginAvailable("Camera"),
    localNotifications: native && isPluginAvailable("LocalNotifications"),
  };
}

/**
 * Safe area insets for notched devices
 */
export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Get safe area insets (for notched devices)
 * Returns zeros on web
 */
export function getSafeAreaInsets(): SafeAreaInsets {
  if (typeof document === "undefined") {
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseInt(style.getPropertyValue("--sat") || "0", 10),
    bottom: parseInt(style.getPropertyValue("--sab") || "0", 10),
    left: parseInt(style.getPropertyValue("--sal") || "0", 10),
    right: parseInt(style.getPropertyValue("--sar") || "0", 10),
  };
}

// Re-export types
export type { Platform, PlatformCapabilities } from "./types";
