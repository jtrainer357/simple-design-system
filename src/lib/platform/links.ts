/**
 * Platform-Safe Link Handler
 *
 * Provides cross-platform utilities for opening external links.
 * Handles the differences between web and native Capacitor environments.
 *
 * @module platform/links
 */

import { isNative } from "./index";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("PlatformLinks");

/**
 * Open a URL in the appropriate browser/viewer for the platform
 *
 * - Web: Opens in a new tab
 * - Native: Opens in the in-app browser or external browser
 *
 * @param url - The URL to open
 * @param options - Options for how to open the link
 */
export async function openExternalLink(
  url: string,
  options: { inApp?: boolean } = {}
): Promise<void> {
  if (!url) {
    log.warn("Attempted to open empty URL");
    return;
  }

  if (isNative()) {
    // On native, use Capacitor Browser plugin for in-app browser
    // or App plugin for external browser
    try {
      // Dynamic import to avoid loading on web
      const { Browser } = await import("@capacitor/browser");

      if (options.inApp !== false) {
        // Open in in-app browser (better UX for most cases)
        await Browser.open({ url });
      } else {
        // Open in external browser
        await Browser.open({
          url,
          windowName: "_system",
        });
      }
    } catch (e) {
      log.error("Failed to open URL in native browser", e);
      // Fallback to window.open
      fallbackOpenLink(url);
    }
    return;
  }

  // Web: Use standard window.open
  fallbackOpenLink(url);
}

/**
 * Fallback link opener using window.open
 */
function fallbackOpenLink(url: string): void {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/**
 * Open a tel: link (phone number)
 *
 * @param phoneNumber - Phone number to call (will be sanitized)
 */
export function openPhoneLink(phoneNumber: string): void {
  const sanitized = phoneNumber.replace(/[^\d+]/g, "");
  const telUrl = `tel:${sanitized}`;

  if (typeof window !== "undefined") {
    window.location.href = telUrl;
  }
}

/**
 * Open a mailto: link
 *
 * @param email - Email address
 * @param options - Subject and body for the email
 */
export function openEmailLink(email: string, options?: { subject?: string; body?: string }): void {
  let mailtoUrl = `mailto:${email}`;

  const params: string[] = [];
  if (options?.subject) {
    params.push(`subject=${encodeURIComponent(options.subject)}`);
  }
  if (options?.body) {
    params.push(`body=${encodeURIComponent(options.body)}`);
  }

  if (params.length > 0) {
    mailtoUrl += `?${params.join("&")}`;
  }

  if (typeof window !== "undefined") {
    window.location.href = mailtoUrl;
  }
}

/**
 * Open a sms: link
 *
 * @param phoneNumber - Phone number to text
 * @param body - Optional message body
 */
export function openSmsLink(phoneNumber: string, body?: string): void {
  const sanitized = phoneNumber.replace(/[^\d+]/g, "");
  let smsUrl = `sms:${sanitized}`;

  if (body) {
    // iOS uses &body=, Android uses ?body=
    // Using ?body= works on most modern devices
    smsUrl += `?body=${encodeURIComponent(body)}`;
  }

  if (typeof window !== "undefined") {
    window.location.href = smsUrl;
  }
}
