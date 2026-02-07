"use client";

/**
 * VoiceLiveRegion - Accessible announcements for voice commands
 *
 * Provides screen reader announcements for voice command feedback
 * using ARIA live regions.
 *
 * @module VoiceLiveRegion
 */

import * as React from "react";
import { voiceEvents } from "@/src/lib/voice/voice-events";

export function VoiceLiveRegion() {
  const [statusMessage, setStatusMessage] = React.useState("");
  const [assertiveMessage, setAssertiveMessage] = React.useState("");

  React.useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Announce navigation events
    unsubs.push(
      voiceEvents.on("navigate", (e) => {
        const route = e.payload.route;
        if (route) {
          const pageName = route.replace("/home/", "").replace("/home", "home") || "home";
          setStatusMessage(`Navigating to ${pageName}`);
        }
      })
    );

    // Announce go home
    unsubs.push(
      voiceEvents.on("go:home", () => {
        setStatusMessage("Navigating to home");
      })
    );

    // Announce patient open
    unsubs.push(
      voiceEvents.on("patient:open", (e) => {
        const patientName = e.payload.patientName;
        if (patientName) {
          setStatusMessage(`Opening patient chart for ${patientName}`);
        }
      })
    );

    // Announce patient tab changes
    unsubs.push(
      voiceEvents.on("patient:tab", (e) => {
        const { patientName, tab } = e.payload;
        if (patientName && tab) {
          setStatusMessage(`Opening ${tab} tab for ${patientName}`);
        }
      })
    );

    // Announce action completion (assertive for important notifications)
    unsubs.push(
      voiceEvents.on("actions:complete", () => {
        setAssertiveMessage("Completing all priority actions");
      })
    );

    // Announce calendar reschedule
    unsubs.push(
      voiceEvents.on("calendar:reschedule", (e) => {
        const { time } = e.payload;
        if (time) {
          setStatusMessage(`Moving appointment to ${time}`);
        }
      })
    );

    // Clear messages after announcement
    const clearTimer = setInterval(() => {
      setStatusMessage("");
      setAssertiveMessage("");
    }, 3000);

    return () => {
      unsubs.forEach((fn) => fn());
      clearInterval(clearTimer);
    };
  }, []);

  return (
    <>
      {/* Polite announcements for status updates */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {/* Assertive announcements for important actions */}
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </>
  );
}
