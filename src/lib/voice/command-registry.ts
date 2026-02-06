/**
 * Voice Command Registry
 *
 * Comprehensive command patterns for the voice-first interface.
 * Each command emits events to the voice event bus for page-level handling.
 *
 * @module command-registry
 */

import type { VoiceCommand } from "./voice-engine";
import { voiceEvents } from "./voice-events";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fuzzy match a string against a map of known values
 */
function fuzzyMatch(input: string, map: Record<string, string>): string | null {
  const normalized = input.toLowerCase().trim();

  // Try exact match first
  if (map[normalized]) return map[normalized];

  // Try includes match
  for (const [key, value] of Object.entries(map)) {
    if (normalized.includes(key) || key.includes(normalized)) return value;
  }

  return null;
}

/**
 * Page route mapping
 */
const PAGE_ROUTES: Record<string, string> = {
  // Home variations
  home: "/home",
  homepage: "/home",
  "home page": "/home",
  "the home": "/home",
  "the homepage": "/home",
  "the home page": "/home",
  dashboard: "/home",
  "the dashboard": "/home",
  main: "/home",
  "main page": "/home",
  // Patients variations
  patients: "/home/patients",
  "patients page": "/home/patients",
  "the patients": "/home/patients",
  "the patients page": "/home/patients",
  "patient list": "/home/patients",
  patient: "/home/patients",
  "my patients": "/home/patients",
  // Calendar/Schedule variations
  calendar: "/home/schedule",
  "calendar page": "/home/schedule",
  "the calendar": "/home/schedule",
  "the calendar page": "/home/schedule",
  schedule: "/home/schedule",
  "schedule page": "/home/schedule",
  "the schedule": "/home/schedule",
  "the schedule page": "/home/schedule",
  "my calendar": "/home/schedule",
  "my schedule": "/home/schedule",
  appointments: "/home/schedule",
  "appointments page": "/home/schedule",
  // Communications/Messages variations
  communications: "/home/communications",
  "communications page": "/home/communications",
  "the communications": "/home/communications",
  messages: "/home/communications",
  "messages page": "/home/communications",
  "the messages": "/home/communications",
  "the messages page": "/home/communications",
  inbox: "/home/communications",
  "the inbox": "/home/communications",
  // Billing variations
  billing: "/home/billing",
  "billing page": "/home/billing",
  "the billing": "/home/billing",
  "the billing page": "/home/billing",
  invoices: "/home/billing",
  "invoices page": "/home/billing",
  // Marketing variations
  marketing: "/home/marketing",
  "marketing page": "/home/marketing",
  "the marketing": "/home/marketing",
  "the marketing page": "/home/marketing",
  reputation: "/home/marketing",
  "reputation page": "/home/marketing",
  "the reputation": "/home/marketing",
  "the reputation page": "/home/marketing",
  "marketing and reputation": "/home/marketing",
  "marketing and reputation page": "/home/marketing",
  "the marketing and reputation": "/home/marketing",
  "the marketing and reputation page": "/home/marketing",
};

/**
 * Tab mapping for patient details
 */
const TAB_MAP: Record<string, string> = {
  notes: "overview",
  note: "overview",
  "session notes": "overview",
  "session note": "overview",
  overview: "overview",
  treatment: "medical-records",
  "treatment plan": "medical-records",
  outcomes: "medical-records",
  outcome: "medical-records",
  "outcome measures": "medical-records",
  "outcome measure": "medical-records",
  "medical records": "medical-records",
  communications: "messages",
  communication: "messages",
  messages: "messages",
  message: "messages",
  appointments: "appointments",
  appointment: "appointments",
  billing: "billing",
  reviews: "reviews",
};

/**
 * Known page names to filter out when matching patient names
 * This list is auto-generated from PAGE_ROUTES keys
 */
const PAGE_NAMES = Object.keys(PAGE_ROUTES);

// ============================================================================
// COMMAND FACTORY
// ============================================================================

/**
 * Create all voice commands
 * IMPORTANT: Order matters! More specific commands must have HIGHER priority (lower number)
 */
export function createCommands(): VoiceCommand[] {
  return [
    // ========================================================================
    // COMPLETE ALL ACTIONS (Priority 1 - Most specific)
    // ========================================================================
    {
      id: "complete-actions",
      priority: 1,
      patterns: [
        /^(?:complete|approve|execute|confirm)\s+(?:all\s+)?(?:actions?|suggested\s+actions?|tasks?)\s*$/i,
        /^(?:complete|approve)\s+all\s*$/i,
      ],
      action: (_match, transcript) => {
        voiceEvents.emit({ type: "actions:complete", payload: {}, transcript });
      },
    },

    // ========================================================================
    // END SESSION (Priority 1)
    // ========================================================================
    {
      id: "end-session",
      priority: 1,
      patterns: [
        /^(?:that\s+)?end(?:s)?\s+(?:our\s+|the\s+)?session$/i,
        /^end\s+session$/i,
        /^stop\s+recording$/i,
      ],
      action: (_match, transcript) => {
        voiceEvents.emit({ type: "session:end", payload: {}, transcript });
      },
    },

    // ========================================================================
    // PRIORITY ACTIONS / TODAY'S ACTIONS FOR PATIENT (Priority 2)
    // ========================================================================
    {
      id: "priority-actions",
      priority: 2,
      patterns: [
        /^(?:show\s+(?:me\s+)?)?(.+?)(?:'s?\s+)?priority\s+actions?\s*$/i,
        /^(?:show\s+(?:me\s+)?)?priority\s+actions?\s+(?:for\s+)?(.+)\s*$/i,
        /^(?:show\s+(?:me\s+)?)?today(?:'s)?\s+actions?\s+(?:for\s+)?(.+)\s*$/i,
        /^(?:show\s+(?:me\s+)?)?(?:the\s+)?actions?\s+(?:for\s+)?(.+)\s*$/i,
      ],
      action: (match, transcript) => {
        const patientName = match[1]?.trim() ?? "";
        if (patientName) {
          voiceEvents.emit({
            type: "patient:actions",
            payload: { patientName },
            transcript,
          });
        }
      },
    },

    // ========================================================================
    // START SESSION (Priority 2)
    // ========================================================================
    {
      id: "start-session",
      priority: 2,
      patterns: [/^(?:start|begin)\s+(?:a\s+)?session\s+(?:with\s+)?(.+)$/i],
      action: (match, transcript) => {
        const patientName = match[1]?.trim() ?? "";
        if (patientName) {
          voiceEvents.emit({
            type: "session:start",
            payload: { patientName },
            transcript,
          });
        }
      },
    },

    // ========================================================================
    // CALENDAR RESCHEDULE (Priority 2)
    // ========================================================================
    {
      id: "reschedule",
      priority: 2,
      patterns: [
        /^(?:move|reschedule|change)\s+(.+?)(?:'s?\s+)?(?:appointment\s+)?(?:to\s+)?(\w+(?:day)?)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i,
        /^(?:move|reschedule)\s+(?:this\s+)?(?:appointment\s+)?(?:to\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i,
      ],
      action: (match, transcript) => {
        // Handle both patterns - first pattern has patient name, day, time
        // Second pattern just has time (for currently selected appointment)
        if (match.length >= 4) {
          voiceEvents.emit({
            type: "calendar:reschedule",
            payload: {
              patientName: match[1]?.trim() ?? "",
              day: match[2]?.trim() ?? "",
              time: match[3]?.trim() ?? "",
            },
            transcript,
          });
        } else {
          // Just time - use currently selected appointment
          voiceEvents.emit({
            type: "calendar:reschedule",
            payload: {
              patientName: "",
              day: "",
              time: match[1]?.trim() ?? "",
            },
            transcript,
          });
        }
      },
    },

    // ========================================================================
    // OPEN PATIENT WITH TAB (Priority 3 - More specific than plain patient)
    // ========================================================================
    {
      id: "open-patient-with-tab",
      priority: 3,
      patterns: [
        /^(?:show\s+me|open|find|take\s+me\s+to)\s+(.+?)(?:'s?\s+)?(notes?|session\s*notes?|treatment\s*plan?|outcomes?|outcome\s*measures?|communications?|messages?|appointments?|billing|reviews?|overview|medical\s*records?)\s*$/i,
      ],
      action: (match, transcript) => {
        const patientName = match[1]?.trim() ?? "";
        const tabRaw = match[2]?.trim().toLowerCase() ?? "";
        const tab = TAB_MAP[tabRaw] || fuzzyMatch(tabRaw, TAB_MAP) || "overview";

        // Don't match if patient name is a page name
        if (!patientName || PAGE_NAMES.includes(patientName.toLowerCase())) {
          return false;
        }

        voiceEvents.emit({
          type: "patient:tab",
          payload: { patientName, tab },
          transcript,
        });
        return; // Explicitly handled
      },
    },

    // ========================================================================
    // OPEN PATIENT (Priority 4 - After patient+tab)
    // ========================================================================
    {
      id: "open-patient",
      priority: 4,
      patterns: [
        /^(?:show\s+me|open|find|take\s+me\s+to)\s+(?:patient\s+)?(.+?)(?:\s+patient)?\s*$/i,
      ],
      action: (match, transcript) => {
        const patientName = match[1]?.trim() ?? "";

        // Don't match if it's a known page name - return false to let navigate-page handle it
        if (PAGE_NAMES.includes(patientName.toLowerCase())) {
          return false;
        }

        // Don't match if it contains "priority actions"
        if (patientName.toLowerCase().includes("priority")) {
          return false;
        }

        voiceEvents.emit({
          type: "patient:open",
          payload: { patientName },
          transcript,
        });
        return; // Handled
      },
    },

    // ========================================================================
    // PAGE NAVIGATION (Priority 5)
    // ========================================================================
    {
      id: "navigate-page",
      priority: 5,
      patterns: [/^(?:take\s+me\s+to|show\s+me|go\s+to|open)\s+(?:my\s+)?(?:the\s+)?(.+)$/i],
      action: (match, transcript) => {
        const page = match[1]?.trim().toLowerCase() ?? "";
        const route = PAGE_ROUTES[page] || fuzzyMatch(page, PAGE_ROUTES);

        if (route) {
          voiceEvents.emit({ type: "navigate", payload: { route }, transcript });
          return; // Handled
        }
        return false; // Not handled - let next command try
      },
    },

    // ========================================================================
    // GO HOME (Priority 6)
    // ========================================================================
    {
      id: "go-home",
      priority: 6,
      patterns: [
        /^(?:go\s+(?:back\s+)?(?:to\s+)?home|go\s+back|back\s+to\s+home|take\s+me\s+home|go\s+to\s+dashboard)\s*$/i,
      ],
      action: (_match, transcript) => {
        voiceEvents.emit({ type: "go:home", payload: {}, transcript });
      },
    },

    // ========================================================================
    // SIMPLE NAVIGATION KEYWORDS (Priority 7 - Catch-all)
    // ========================================================================
    {
      id: "simple-navigation",
      priority: 7,
      patterns: [
        /^calendar$/i,
        /^schedule$/i,
        /^patients$/i,
        /^billing$/i,
        /^marketing$/i,
        /^messages$/i,
        /^communications$/i,
        /^home$/i,
        /^dashboard$/i,
      ],
      action: (match, transcript) => {
        const keyword = match[0].toLowerCase();
        const route = PAGE_ROUTES[keyword];

        if (route) {
          voiceEvents.emit({ type: "navigate", payload: { route }, transcript });
        }
      },
    },
  ];
}

// ============================================================================
// FALLBACK RESPONSE
// ============================================================================

export const FALLBACK_RESPONSE =
  "I didn't catch that. You can ask me to show a patient, navigate somewhere, or reschedule an appointment.";
