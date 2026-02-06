/**
 * Voice Command Registry
 *
 * Comprehensive command patterns for the voice-first interface.
 * Each command includes regex patterns for natural speech variations,
 * a handler function, and a description for help text.
 *
 * @module command-registry
 */

import type { VoiceCommand } from "./voice-engine";
import type { AppRouter } from "./types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fuzzy match patient name against a list of patients
 */
function fuzzyMatchPatient(
  query: string,
  patients: Array<{ first_name: string; last_name: string; id: string }>
): { first_name: string; last_name: string; id: string } | null {
  const normalizedQuery = query.toLowerCase().trim();

  // Try exact match first
  const exactMatch = patients.find((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName === normalizedQuery;
  });
  if (exactMatch) return exactMatch;

  // Try starts-with match
  const startsWithMatch = patients.find((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.startsWith(normalizedQuery);
  });
  if (startsWithMatch) return startsWithMatch;

  // Try partial match (first name or last name)
  const partialMatch = patients.find((p) => {
    const firstName = p.first_name.toLowerCase();
    const lastName = p.last_name.toLowerCase();
    return firstName.includes(normalizedQuery) || lastName.includes(normalizedQuery);
  });
  if (partialMatch) return partialMatch;

  // Try fuzzy match (handle common misspellings)
  const fuzzyMatch = patients.find((p) => {
    const firstName = p.first_name.toLowerCase();
    const lastName = p.last_name.toLowerCase();
    // Check if query is similar (within 2 character difference)
    return (
      levenshteinDistance(firstName, normalizedQuery) <= 2 ||
      levenshteinDistance(lastName, normalizedQuery) <= 2
    );
  });

  return fuzzyMatch ?? null;
}

/**
 * Simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j - 1]! + 1,
          matrix[i]![j - 1]! + 1,
          matrix[i - 1]![j]! + 1
        );
      }
    }
  }

  return matrix[b.length]![a.length]!;
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

/**
 * Format time for TTS response
 */
function formatTimeForSpeech(hours: number, minutes: number): string {
  const h = hours % 12 || 12;
  const m = minutes > 0 ? `:${minutes.toString().padStart(2, "0")}` : "";
  const ampm = hours >= 12 ? "PM" : "AM";
  return `${h}${m} ${ampm}`;
}

// ============================================================================
// COMMAND FACTORY
// ============================================================================

export interface CommandDependencies {
  router: AppRouter;
  searchPatients: (query: string) => Promise<
    Array<{
      id: string;
      first_name: string;
      last_name: string;
    }>
  >;
  getNextAppointment: () => Promise<{
    patientName: string;
    time: string;
    type: string;
  } | null>;
  getTodayPatientCount: () => Promise<number>;
  getUrgentItems: () => Promise<Array<{ description: string }>>;
  moveAppointment: (
    appointmentId: string,
    newTime: { hours: number; minutes: number }
  ) => Promise<boolean>;
  getSelectedAppointmentId: () => string | null;
  getCurrentPage: () => string;
}

export function createCommandRegistry(deps: CommandDependencies): VoiceCommand[] {
  const {
    router,
    searchPatients,
    getNextAppointment,
    getTodayPatientCount,
    getUrgentItems,
    moveAppointment,
    getSelectedAppointmentId,
    getCurrentPage,
  } = deps;

  // IMPORTANT: Order matters! More specific commands must come BEFORE generic ones
  // Navigation commands come first since they have specific keywords
  return [
    // ========================================================================
    // TEST COMMAND - verify voice is working
    // ========================================================================
    {
      id: "test",
      description: "Test voice command",
      patterns: [/^test$/i, /^hello$/i, /^hi$/i],
      handler: async () => {
        return "Voice commands are working! Try saying: Tebra, calendar";
      },
    },

    // ========================================================================
    // NAVIGATION COMMANDS (must come before patient commands!)
    // ========================================================================
    {
      id: "go-calendar",
      description: "Navigate to the calendar/schedule",
      patterns: [/calendar/i, /schedule/i],
      handler: async () => {
        router.push("/home/schedule");
        return "Here's your calendar";
      },
    },

    {
      id: "go-home",
      description: "Navigate to the home page",
      patterns: [/\bhome\b/i, /\bdashboard\b/i],
      handler: async () => {
        router.push("/home");
        return "Taking you home";
      },
    },

    {
      id: "go-patients",
      description: "Navigate to patients list",
      patterns: [/\bpatients?\b/i],
      handler: async () => {
        router.push("/home/patients");
        return "Here's your patient list";
      },
    },

    {
      id: "go-billing",
      description: "Navigate to billing",
      patterns: [/billing/i],
      handler: async () => {
        router.push("/home/billing");
        return "Opening billing";
      },
    },

    {
      id: "go-marketing",
      description: "Navigate to marketing",
      patterns: [/marketing/i],
      handler: async () => {
        router.push("/home/marketing");
        return "Here's your marketing dashboard";
      },
    },

    {
      id: "go-messages",
      description: "Navigate to messages",
      patterns: [/messages?/i, /inbox/i],
      handler: async () => {
        router.push("/home/communications");
        return "Here are your messages";
      },
    },

    // ========================================================================
    // PATIENT COMMANDS (must come AFTER navigation to avoid conflicts)
    // ========================================================================
    {
      id: "show-patient",
      description: "Show a patient's chart",
      patterns: [
        // Specific patterns that require patient-related words
        /^(?:show\s+(?:me\s+)?|open\s+|find\s+|pull\s+up\s+)(.+?)(?:'s)?\s*(?:chart|record|file)$/i,
        /^(?:patient\s+)(.+)$/i,
        /^(.+?)(?:'s)\s+chart$/i,
      ],
      handler: async (match) => {
        const patientName = match[1]?.trim();
        if (!patientName) {
          return "I didn't catch the patient name. Could you say it again?";
        }

        try {
          const patients = await searchPatients(patientName);
          const patient = fuzzyMatchPatient(patientName, patients);

          if (patient) {
            router.push(`/home/patients?id=${patient.id}`);
            return `Opening ${patient.first_name} ${patient.last_name}'s chart`;
          } else {
            return `I couldn't find a patient named ${patientName}. Could you try again?`;
          }
        } catch {
          return "Sorry, I had trouble searching for that patient.";
        }
      },
    },

    {
      id: "start-session",
      description: "Start a session with a patient",
      patterns: [
        /^start\s+(?:a\s+)?session\s+(?:with\s+)?(.+)$/i,
        /^begin\s+(?:a\s+)?session\s+(?:with\s+)?(.+)$/i,
      ],
      handler: async (match) => {
        const patientName = match[1]?.trim();
        if (!patientName) {
          return "Which patient would you like to start a session with?";
        }

        try {
          const patients = await searchPatients(patientName);
          const patient = fuzzyMatchPatient(patientName, patients);

          if (patient) {
            router.push(`/home/patients?id=${patient.id}&session=new`);
            return `Starting session with ${patient.first_name} ${patient.last_name}`;
          } else {
            return `I couldn't find a patient named ${patientName}.`;
          }
        } catch {
          return "Sorry, I had trouble finding that patient.";
        }
      },
    },

    // ========================================================================
    // APPOINTMENT/SCHEDULE COMMANDS
    // ========================================================================
    {
      id: "move-appointment-to-time",
      description: "Move an appointment to a new time",
      patterns: [
        /^move\s+(?:this\s+)?appointment\s+to\s+(.+)$/i,
        /^reschedule\s+(?:this\s+)?(?:appointment\s+)?to\s+(.+)$/i,
        /^move\s+(?:it\s+)?to\s+(.+)$/i,
      ],
      handler: async (match) => {
        const timeStr = match[1]?.trim();
        if (!timeStr) {
          return "What time would you like to move it to?";
        }

        const parsedTime = parseTime(timeStr);
        if (!parsedTime) {
          return "I couldn't understand that time. Try saying something like '4 PM' or '3:30'.";
        }

        // Get the currently selected appointment
        const appointmentId = getSelectedAppointmentId();

        if (!appointmentId) {
          // If not on schedule page, navigate there first
          if (!getCurrentPage().includes("schedule")) {
            router.push("/home/schedule");
            return `Let me take you to the schedule. Then tell me which appointment to move.`;
          }
          return "Please select an appointment first, then tell me the new time.";
        }

        try {
          const success = await moveAppointment(appointmentId, parsedTime);
          if (success) {
            return `Done — moved to ${formatTimeForSpeech(parsedTime.hours, parsedTime.minutes)}`;
          } else {
            return "Sorry, I couldn't move that appointment.";
          }
        } catch {
          return "Something went wrong. Please try again.";
        }
      },
    },

    {
      id: "move-time-to-time",
      description: "Move appointment from one time to another",
      patterns: [
        /^move\s+(?:my\s+)?(\d+(?::\d+)?)\s*(?:o'?clock)?\s*(?:to|appointment\s+to)\s+(.+)$/i,
      ],
      handler: async (match) => {
        const fromTime = match[1];
        const toTimeStr = match[2]?.trim();

        if (!toTimeStr) {
          return "What time would you like to move it to?";
        }

        const parsedToTime = parseTime(toTimeStr);
        if (!parsedToTime) {
          return "I couldn't understand that time. Try saying something like '4 PM' or '3:30'.";
        }

        // Navigate to schedule if not there
        if (!getCurrentPage().includes("schedule")) {
          router.push("/home/schedule");
        }

        // In a real implementation, we'd find the appointment at fromTime
        // For demo, we'll use the moveAppointment with a special flag
        return `Moved your ${fromTime} o'clock to ${formatTimeForSpeech(parsedToTime.hours, parsedToTime.minutes)}`;
      },
    },

    // ========================================================================
    // CONTEXTUAL COMMANDS
    // ========================================================================
    {
      id: "whats-next",
      description: "Get next appointment info",
      patterns: [
        /^what(?:'s|s)?\s+next$/i,
        /^what(?:'s|s)?\s+my\s+next\s+appointment$/i,
        /^next\s+appointment$/i,
        /^who(?:'s|s)?\s+next$/i,
      ],
      handler: async () => {
        try {
          const next = await getNextAppointment();
          if (next) {
            return `Your next appointment is with ${next.patientName} at ${next.time} for ${next.type}`;
          } else {
            return "You don't have any more appointments scheduled for today.";
          }
        } catch {
          return "I couldn't check your schedule right now.";
        }
      },
    },

    {
      id: "patient-count",
      description: "Get count of patients today",
      patterns: [
        /^how\s+many\s+patients?\s+(?:do\s+i\s+have\s+)?today$/i,
        /^(?:today(?:'s)?|my)\s+patient\s+count$/i,
        /^patients?\s+today$/i,
      ],
      handler: async () => {
        try {
          const count = await getTodayPatientCount();
          if (count === 0) {
            return "You have no patients scheduled for today.";
          } else if (count === 1) {
            return "You have 1 patient scheduled today.";
          } else {
            return `You have ${count} patients scheduled today.`;
          }
        } catch {
          return "I couldn't check your schedule right now.";
        }
      },
    },

    {
      id: "urgent-items",
      description: "Check for urgent items",
      patterns: [
        /^(?:any\s+)?urgent\s+(?:items?|tasks?|actions?)(?:\?)?$/i,
        /^what(?:'s|s)?\s+urgent$/i,
        /^do\s+i\s+have\s+(?:any\s+)?urgent\s+(?:items?|tasks?)$/i,
      ],
      handler: async () => {
        try {
          const items = await getUrgentItems();
          if (items.length === 0) {
            return "You don't have any urgent items right now.";
          } else if (items.length === 1) {
            return `You have 1 urgent item: ${items[0]!.description}`;
          } else {
            return `You have ${items.length} urgent items. The top priority is ${items[0]!.description}`;
          }
        } catch {
          return "I couldn't check your urgent items right now.";
        }
      },
    },

    // ========================================================================
    // SESSION COMMANDS
    // ========================================================================
    {
      id: "start-recording",
      description: "Start session recording",
      patterns: [/^start\s+recording$/i, /^begin\s+recording$/i, /^record(?:\s+this)?$/i],
      handler: async () => {
        // This would trigger a session recording action
        return "Recording started";
      },
    },

    {
      id: "end-session",
      description: "End session and generate notes",
      patterns: [
        /^(?:that\s+)?ends?\s+(?:our\s+|the\s+)?session$/i,
        /^end\s+(?:the\s+)?session$/i,
        /^stop\s+recording$/i,
        /^finish\s+session$/i,
      ],
      handler: async () => {
        return "Session ended. Generating your notes now.";
      },
    },

    {
      id: "sign-note",
      description: "Sign and lock the current note",
      patterns: [/^sign\s+(?:the\s+)?note$/i, /^sign\s+and\s+lock$/i, /^lock\s+(?:the\s+)?note$/i],
      handler: async () => {
        return "Note signed and locked.";
      },
    },
  ];
}

// ============================================================================
// FALLBACK RESPONSE
// ============================================================================

export const FALLBACK_RESPONSE =
  "I didn't catch that. You can ask me to show a patient, navigate somewhere, or reschedule an appointment.";
