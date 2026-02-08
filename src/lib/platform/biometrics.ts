/**
 * Biometric Authentication Platform Abstraction
 *
 * Provides biometric authentication across platforms:
 * - iOS: Face ID, Touch ID
 * - Android: Fingerprint, Face Unlock
 * - Web: WebAuthn (stub for now)
 *
 * @module platform/biometrics
 */

import { isNative, isIOS, isAndroid } from "./index";
import type { BiometricResult } from "./types";

/**
 * Biometric type available on the device
 */
export type BiometricType = "faceId" | "touchId" | "fingerprint" | "iris" | "none";

/**
 * Check if biometric authentication is available on this device
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (isNative()) {
    // On native, biometrics are typically available
    // Full implementation would use a native biometrics plugin
    // For now, assume available on native
    return true;
  }

  // Web: Check for WebAuthn support
  if (typeof window !== "undefined" && window.PublicKeyCredential) {
    try {
      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get the type of biometric available on this device
 */
export async function getBiometricType(): Promise<BiometricType> {
  if (!isNative()) {
    // Web doesn't expose specific biometric type
    const available = await isBiometricAvailable();
    return available ? "fingerprint" : "none"; // Generic for web
  }

  // On iOS, we can infer from device capabilities
  if (isIOS()) {
    // Face ID devices: iPhone X and later, iPad Pro 2018 and later
    // Touch ID: Earlier devices
    // This is a simplified check - full implementation would use native plugin
    return "faceId"; // Default to Face ID for modern iOS
  }

  if (isAndroid()) {
    // Android typically uses fingerprint
    return "fingerprint";
  }

  return "none";
}

/**
 * Authenticate using biometrics
 *
 * NOTE: This is a stub implementation. Full implementation requires:
 * - iOS/Android: @capacitor-community/biometric-auth or similar
 * - Web: Full WebAuthn credential flow
 *
 * @param reason - Reason shown to user for authentication
 */
export async function authenticateWithBiometrics(reason?: string): Promise<BiometricResult> {
  const isAvailable = await isBiometricAvailable();

  if (!isAvailable) {
    return {
      success: false,
      error: "Biometric authentication not available",
    };
  }

  if (isNative()) {
    // STUB: Native biometric authentication
    // Full implementation would use:
    // import { BiometricAuth } from '@capacitor-community/biometric-auth'
    // await BiometricAuth.authenticate({ reason: reason || 'Authenticate' })

    console.warn(
      "[Biometrics] Native biometric auth requires @capacitor-community/biometric-auth plugin"
    );

    // For demo purposes, simulate success
    // In production, this would call the native biometric API
    return {
      success: true,
      type: isIOS() ? "faceId" : "fingerprint",
    };
  }

  // Web: WebAuthn stub
  // Full implementation would create/get credentials
  console.warn("[Biometrics] WebAuthn authentication not fully implemented");

  // For demo purposes, simulate the user canceling
  // In production, this would use navigator.credentials.get()
  return {
    success: false,
    error: "WebAuthn not implemented - use native app for biometrics",
  };
}

/**
 * Check if the device is secured (has passcode/pattern lock)
 */
export async function isDeviceSecured(): Promise<boolean> {
  if (isNative()) {
    // Native devices with biometrics are typically secured
    // Full implementation would check with native plugin
    return true;
  }

  // Web: Assume secured if WebAuthn is available
  return await isBiometricAvailable();
}

/**
 * Prompt user to set up biometrics (navigates to device settings on native)
 */
export async function promptBiometricSetup(): Promise<void> {
  if (isNative()) {
    // This would open device settings
    // Full implementation would use native plugin
    console.warn("[Biometrics] Native settings navigation not implemented");
    return;
  }

  // Web: Can't navigate to system settings
  console.warn("[Biometrics] Cannot open system settings from web");
}
