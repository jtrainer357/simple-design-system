"use client";

/**
 * VoiceProvider - Global Voice Command System Provider
 *
 * Initializes the voice command system, registers commands,
 * and handles event routing. Should be placed near the root of the app.
 *
 * @module VoiceProvider
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { voiceEngine } from "@/src/lib/voice/voice-engine";
import { createCommands } from "@/src/lib/voice/command-registry";
import { voiceEvents } from "@/src/lib/voice/voice-events";
import { VoiceLiveRegion } from "./VoiceLiveRegion";

// Demo patients data for voice commands - must match actual database patients
// Using shorter names where possible for better speech recognition
const DEMO_PATIENTS = [
  { id: "1", first_name: "Brian", last_name: "Anton" },
  { id: "2", first_name: "Anthony", last_name: "Benedetti" },
  { id: "3", first_name: "Ryan", last_name: "Campanelli" },
  { id: "4", first_name: "Amanda", last_name: "Chen" },
  { id: "5", first_name: "Emily", last_name: "Chen" },
  { id: "6", first_name: "Heather", last_name: "Donovan" },
  { id: "7", first_name: "Kevin", last_name: "Goldstein" },
  { id: "8", first_name: "Marcus", last_name: "Johnson" },
  { id: "9", first_name: "David", last_name: "Rodriguez" },
  { id: "10", first_name: "Sarah", last_name: "Mitchell" },
  { id: "11", first_name: "Robert", last_name: "Thompson" },
];

/**
 * Fuzzy match patient name against demo patients
 * Priority: exact match > both parts match > first name match > last name match
 */
function findPatient(query: string): (typeof DEMO_PATIENTS)[0] | null {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/);

  // Try exact match first
  const exactMatch = DEMO_PATIENTS.find((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName === normalizedQuery;
  });
  if (exactMatch) {
    return exactMatch;
  }

  // Try starts-with match on full name
  const startsWithMatch = DEMO_PATIENTS.find((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.startsWith(normalizedQuery);
  });
  if (startsWithMatch) {
    return startsWithMatch;
  }

  // For multi-word queries, try matching BOTH first and last name
  if (queryWords.length >= 2) {
    const bothPartsMatch = DEMO_PATIENTS.find((p) => {
      const firstName = p.first_name.toLowerCase();
      const lastName = p.last_name.toLowerCase();
      // Check if query words match both first AND last name
      const hasFirstMatch = queryWords.some((w) => firstName.includes(w) || w.includes(firstName));
      const hasLastMatch = queryWords.some((w) => lastName.includes(w) || w.includes(lastName));
      return hasFirstMatch && hasLastMatch;
    });
    if (bothPartsMatch) {
      return bothPartsMatch;
    }
  }

  // Single word or no multi-match: try first name only
  const firstNameMatch = DEMO_PATIENTS.find((p) => {
    const firstName = p.first_name.toLowerCase();
    return firstName === normalizedQuery || firstName.startsWith(normalizedQuery);
  });
  if (firstNameMatch) {
    return firstNameMatch;
  }

  // Try last name only
  const lastNameMatch = DEMO_PATIENTS.find((p) => {
    const lastName = p.last_name.toLowerCase();
    return lastName === normalizedQuery || lastName.startsWith(normalizedQuery);
  });
  if (lastNameMatch) {
    return lastNameMatch;
  }

  // Fallback: partial match on either name
  const partialMatch = DEMO_PATIENTS.find((p) => {
    const firstName = p.first_name.toLowerCase();
    const lastName = p.last_name.toLowerCase();
    return firstName.includes(normalizedQuery) || lastName.includes(normalizedQuery);
  });

  return partialMatch ?? null;
}

interface VoiceProviderProps {
  children: React.ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
  const router = useRouter();

  // Initialize voice system and register commands
  // Run on every mount to handle hot reload properly
  React.useEffect(() => {
    // Register all commands (registerCommands handles deduplication)
    const commands = createCommands();
    voiceEngine.registerCommands(commands);

    return () => {
      voiceEngine.clearCommands();
    };
  }, []);

  // Set up event listeners for routing
  React.useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Handle page navigation
    unsubs.push(
      voiceEvents.on("navigate", (e) => {
        const route = e.payload.route;
        if (route) {
          router.push(route);
        }
      })
    );

    // Handle go home
    unsubs.push(
      voiceEvents.on("go:home", () => {
        router.push("/home");
      })
    );

    // Handle open patient
    unsubs.push(
      voiceEvents.on("patient:open", (e) => {
        const patientName = e.payload.patientName;
        if (!patientName) return;
        const patient = findPatient(patientName);
        if (patient) {
          // Use patient name in URL for more reliable matching
          const encodedName = encodeURIComponent(`${patient.first_name} ${patient.last_name}`);
          router.push(`/home/patients?patientName=${encodedName}`);
        }
      })
    );

    // Handle open patient with specific tab
    unsubs.push(
      voiceEvents.on("patient:tab", (e) => {
        const patientName = e.payload.patientName;
        const tab = e.payload.tab;
        if (!patientName) return;
        const patient = findPatient(patientName);
        if (patient) {
          // Use patient name in URL for more reliable matching
          const encodedName = encodeURIComponent(`${patient.first_name} ${patient.last_name}`);
          router.push(`/home/patients?patientName=${encodedName}&tab=${tab || "overview"}`);
        }
      })
    );

    // Handle priority actions - dispatch custom event for homepage to open patient detail
    unsubs.push(
      voiceEvents.on("patient:actions", (e) => {
        const patientName = e.payload.patientName;
        if (!patientName) return;
        const patient = findPatient(patientName);
        if (patient) {
          // Dispatch custom event for homepage to handle
          window.dispatchEvent(
            new CustomEvent("voice-open-patient-actions", {
              detail: { patientName: `${patient.first_name} ${patient.last_name}` },
            })
          );
        }
      })
    );

    // Handle calendar reschedule - dispatch custom event for calendar page to handle
    unsubs.push(
      voiceEvents.on("calendar:reschedule", (e) => {
        const { time } = e.payload;
        if (time) {
          // Parse time string to hours/minutes
          const parsedTime = parseTime(time);
          if (parsedTime) {
            // Dispatch custom event for calendar page
            window.dispatchEvent(
              new CustomEvent("voice-move-appointment", {
                detail: { appointmentId: "", newTime: parsedTime },
              })
            );
          }
        }
      })
    );

    // Handle session start
    unsubs.push(
      voiceEvents.on("session:start", (e) => {
        const patientName = e.payload.patientName;
        if (!patientName) return;
        const patient = findPatient(patientName);
        if (patient) {
          const encodedName = encodeURIComponent(`${patient.first_name} ${patient.last_name}`);
          router.push(`/home/patients?patientName=${encodedName}&session=new`);
        }
      })
    );

    // Handle complete all actions - dispatch custom event
    unsubs.push(
      voiceEvents.on("actions:complete", () => {
        window.dispatchEvent(new CustomEvent("voice-complete-actions"));
      })
    );

    return () => unsubs.forEach((fn) => fn());
  }, [router]);

  return (
    <>
      <VoiceLiveRegion />
      {children}
    </>
  );
}

/**
 * Parse time from natural language (e.g., "4 pm", "3:30", "14:00")
 */
function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  const normalized = timeStr.toLowerCase().replace(/\s+/g, "");

  // Match "4pm", "4 pm", "4:30pm", "16:00"
  const patterns = [
    /^(\d{1,2}):?(\d{2})?\s*(am|pm)?$/,
    /^(\d{1,2})\s*(am|pm)$/,
    /^(\d{1,2})\s*o'?clock$/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      let hours = parseInt(match[1]!, 10);
      const minutes = match[2] ? parseInt(match[2], 10) : 0;
      const meridiem = match[3];

      // Handle 12-hour format
      if (meridiem === "pm" && hours !== 12) {
        hours += 12;
      } else if (meridiem === "am" && hours === 12) {
        hours = 0;
      }

      // If no meridiem and hours < 8, assume PM (business hours)
      if (!meridiem && hours < 8 && hours > 0) {
        hours += 12;
      }

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
  }

  return null;
}
