/**
 * Haptic Feedback Platform Abstraction
 *
 * Provides haptic feedback on supported devices:
 * - Native: Uses @capacitor/haptics
 * - Web: No-op (most browsers don't support vibration well)
 *
 * @module platform/haptics
 */

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNative } from "./index";
import type { HapticStyle, HapticType } from "./types";

/**
 * Map our haptic styles to Capacitor ImpactStyle
 */
const impactStyleMap: Record<HapticStyle, ImpactStyle> = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

/**
 * Map haptic notification types to Capacitor NotificationType
 */
const notificationTypeMap: Record<"success" | "warning" | "error", NotificationType> = {
  success: NotificationType.Success,
  warning: NotificationType.Warning,
  error: NotificationType.Error,
};

/**
 * Trigger an impact haptic feedback
 * @param style - Intensity of the haptic: 'light', 'medium', or 'heavy'
 */
export async function triggerHaptic(style: HapticStyle = "medium"): Promise<void> {
  if (!isNative()) {
    // Web fallback - try vibration API if available
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const duration = style === "light" ? 10 : style === "medium" ? 25 : 50;
      navigator.vibrate(duration);
    }
    return;
  }

  try {
    await Haptics.impact({ style: impactStyleMap[style] });
  } catch {
    // Ignore haptic errors - device may not support it
  }
}

/**
 * Trigger a notification-style haptic
 * @param type - Type of notification: 'success', 'warning', or 'error'
 */
export async function triggerNotificationHaptic(
  type: "success" | "warning" | "error"
): Promise<void> {
  if (!isNative()) {
    // Web fallback - pattern vibration
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      const patterns: Record<string, number[]> = {
        success: [10, 50, 10],
        warning: [25, 50, 25],
        error: [50, 100, 50],
      };
      navigator.vibrate(patterns[type] || [25]);
    }
    return;
  }

  try {
    await Haptics.notification({ type: notificationTypeMap[type] });
  } catch {
    // Ignore haptic errors
  }
}

/**
 * Trigger a selection haptic (light tap for UI feedback)
 */
export async function triggerSelectionHaptic(): Promise<void> {
  if (!isNative()) {
    // Very light vibration on web
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(5);
    }
    return;
  }

  try {
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch {
    // Ignore haptic errors
  }
}

/**
 * Unified haptic trigger function
 */
export async function haptic(type: HapticType, style?: HapticStyle): Promise<void> {
  switch (type) {
    case "impact":
      return triggerHaptic(style || "medium");
    case "selection":
      return triggerSelectionHaptic();
    case "notification":
      return triggerNotificationHaptic("success");
    default:
      return triggerHaptic("medium");
  }
}

/**
 * Check if haptics are supported
 */
export function isHapticsSupported(): boolean {
  if (isNative()) {
    return true; // Always supported on native with plugin
  }

  // Check for web vibration API
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}
