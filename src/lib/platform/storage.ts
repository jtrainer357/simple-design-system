/**
 * Secure Storage Platform Abstraction
 *
 * Provides secure key-value storage across platforms:
 * - iOS: Keychain
 * - Android: KeyStore + EncryptedSharedPreferences
 * - Web: Encrypted localStorage (stub - uses plain localStorage for demo)
 *
 * @module platform/storage
 */

import { isNative } from "./index";

/**
 * Storage keys that should be securely stored
 */
export type SecureStorageKey =
  | "auth_token"
  | "refresh_token"
  | "biometric_enabled"
  | "user_id"
  | "encryption_key"
  | string;

/**
 * Securely store a value
 *
 * NOTE: This is a stub implementation for web. Full implementation requires:
 * - Native: @capacitor-community/secure-storage-plugin
 * - Web: Would need Web Crypto API encryption with a derived key
 *
 * @param key - Storage key
 * @param value - Value to store
 */
export async function secureSet(key: SecureStorageKey, value: string): Promise<void> {
  if (isNative()) {
    // STUB: Native secure storage
    // Full implementation would use:
    // import { SecureStoragePlugin } from '@capacitor-community/secure-storage-plugin'
    // await SecureStoragePlugin.set({ key, value })

    console.warn(
      "[SecureStorage] Native secure storage requires @capacitor-community/secure-storage-plugin"
    );

    // Fallback to localStorage for demo (NOT SECURE for production)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(`secure_${key}`, value);
    }
    return;
  }

  // Web: Use localStorage with a warning
  // Production implementation would:
  // 1. Derive a key from user credentials using PBKDF2
  // 2. Encrypt value with AES-GCM
  // 3. Store encrypted value in localStorage

  if (typeof localStorage !== "undefined") {
    // Simple obfuscation (NOT SECURE - for demo only)
    const obfuscated = btoa(value);
    localStorage.setItem(`secure_${key}`, obfuscated);
  }
}

/**
 * Securely retrieve a value
 *
 * @param key - Storage key
 * @returns The stored value or null if not found
 */
export async function secureGet(key: SecureStorageKey): Promise<string | null> {
  if (isNative()) {
    // STUB: Native secure storage
    // Full implementation would use:
    // import { SecureStoragePlugin } from '@capacitor-community/secure-storage-plugin'
    // const result = await SecureStoragePlugin.get({ key })
    // return result.value

    // Fallback to localStorage for demo
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(`secure_${key}`);
    }
    return null;
  }

  // Web: Retrieve and decode
  if (typeof localStorage !== "undefined") {
    const obfuscated = localStorage.getItem(`secure_${key}`);
    if (obfuscated) {
      try {
        return atob(obfuscated);
      } catch {
        // Invalid base64 - return as-is (migration case)
        return obfuscated;
      }
    }
  }

  return null;
}

/**
 * Securely delete a value
 *
 * @param key - Storage key
 */
export async function secureDelete(key: SecureStorageKey): Promise<void> {
  if (isNative()) {
    // STUB: Native secure storage
    // Full implementation would use:
    // import { SecureStoragePlugin } from '@capacitor-community/secure-storage-plugin'
    // await SecureStoragePlugin.remove({ key })

    // Fallback to localStorage for demo
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(`secure_${key}`);
    }
    return;
  }

  // Web: Remove from localStorage
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(`secure_${key}`);
  }
}

/**
 * Clear all secure storage
 */
export async function secureClear(): Promise<void> {
  if (isNative()) {
    // STUB: Native secure storage
    // Full implementation would use:
    // import { SecureStoragePlugin } from '@capacitor-community/secure-storage-plugin'
    // await SecureStoragePlugin.clear()

    // Fallback: Clear all secure_ prefixed items
    if (typeof localStorage !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("secure_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
    return;
  }

  // Web: Clear all secure_ prefixed items
  if (typeof localStorage !== "undefined") {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("secure_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}

/**
 * Check if secure storage is available
 */
export function isSecureStorageAvailable(): boolean {
  if (isNative()) {
    // Native always has secure storage capability
    return true;
  }

  // Web: Check for localStorage (our fallback)
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem("__test__", "test");
      localStorage.removeItem("__test__");
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Get all secure storage keys
 * Useful for debugging and migration
 */
export async function getSecureKeys(): Promise<string[]> {
  const keys: string[] = [];

  if (typeof localStorage !== "undefined") {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("secure_")) {
        keys.push(key.replace("secure_", ""));
      }
    }
  }

  return keys;
}
