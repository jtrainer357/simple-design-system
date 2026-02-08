/**
 * Push Notification Platform Abstraction
 *
 * Provides a unified interface for notifications across platforms:
 * - Web: Uses the Notification API
 * - Native: Uses @capacitor/push-notifications
 *
 * @module platform/notifications
 */

import { PushNotifications } from "@capacitor/push-notifications";
import { isNative } from "./index";
import type { NotificationOptions } from "./types";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("Notifications");

/**
 * Request permission to send notifications
 * @returns Promise<boolean> - true if permission granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isNative()) {
    return requestNativePermission();
  }
  return requestWebPermission();
}

/**
 * Request native push notification permission
 */
async function requestNativePermission(): Promise<boolean> {
  try {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === "granted") {
      // Register with APNs/FCM
      await PushNotifications.register();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Request web notification permission
 */
async function requestWebPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

/**
 * Check current notification permission status
 */
export async function checkNotificationPermission(): Promise<"granted" | "denied" | "prompt"> {
  if (isNative()) {
    try {
      const result = await PushNotifications.checkPermissions();
      if (result.receive === "granted") return "granted";
      if (result.receive === "denied") return "denied";
      return "prompt";
    } catch {
      return "denied";
    }
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  return Notification.permission as "granted" | "denied" | "prompt";
}

/**
 * Schedule a local notification
 * Note: Full local notification support requires @capacitor/local-notifications
 * This is a simplified implementation for basic use cases
 */
export async function scheduleLocalNotification(options: NotificationOptions): Promise<string> {
  const id = options.id || crypto.randomUUID();

  if (isNative()) {
    // For full local notification support, use @capacitor/local-notifications
    // This is a stub that shows immediate notifications
    log.warn("Local notifications on native require @capacitor/local-notifications");
    return id;
  }

  // Web implementation
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("Notifications not supported");
  }

  if (Notification.permission !== "granted") {
    throw new Error("Notification permission not granted");
  }

  if (options.scheduledAt) {
    // Schedule for later
    const delay = options.scheduledAt.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        showWebNotification(options);
      }, delay);
    } else {
      // Already past scheduled time, show immediately
      showWebNotification(options);
    }
  } else {
    // Show immediately
    showWebNotification(options);
  }

  return id;
}

/**
 * Show a web notification
 */
function showWebNotification(options: NotificationOptions): void {
  new Notification(options.title, {
    body: options.body,
    data: options.data,
    badge: options.badge?.toString(),
    silent: !options.sound,
  });
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(id: string): Promise<void> {
  if (isNative()) {
    // For full support, use @capacitor/local-notifications
    log.warn("Canceling notifications on native requires @capacitor/local-notifications");
    return;
  }

  // Web doesn't support canceling scheduled notifications easily
  // Would need to track timeouts
  log.warn("Web notification cancellation not fully implemented", { notificationId: id });
}

/**
 * Register a listener for push notification tokens (native only)
 */
export async function onPushToken(callback: (token: string) => void): Promise<() => void> {
  if (!isNative()) {
    return () => {}; // No-op for web
  }

  const listener = await PushNotifications.addListener("registration", (token) => {
    callback(token.value);
  });

  return () => {
    listener.remove();
  };
}

/**
 * Register a listener for push notification reception (native only)
 */
export async function onPushNotification(
  callback: (notification: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }) => void
): Promise<() => void> {
  if (!isNative()) {
    return () => {}; // No-op for web
  }

  const listener = await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      callback({
        title: notification.title,
        body: notification.body,
        data: notification.data as Record<string, unknown>,
      });
    }
  );

  return () => {
    listener.remove();
  };
}

/**
 * Register a listener for push notification tap actions (native only)
 */
export async function onPushNotificationAction(
  callback: (notification: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }) => void
): Promise<() => void> {
  if (!isNative()) {
    return () => {}; // No-op for web
  }

  const listener = await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (action) => {
      callback({
        title: action.notification.title,
        body: action.notification.body,
        data: action.notification.data as Record<string, unknown>,
      });
    }
  );

  return () => {
    listener.remove();
  };
}
