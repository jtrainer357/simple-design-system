"use client";

/**
 * VoiceProvider - Global Voice Command System Provider
 *
 * This component initializes the voice command system, registers commands,
 * and provides the voice control UI. Should be placed near the root of the app.
 *
 * @module VoiceProvider
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  voiceEngine,
  createCommandRegistry,
  useVoiceStore,
  FALLBACK_RESPONSE,
} from "@/src/lib/voice";
import type { CommandDependencies } from "@/src/lib/voice";
// VoiceTranscript is now rendered inline in HeaderSearch

// Demo patients data for voice commands
const DEMO_PATIENTS = [
  { id: "p-001", first_name: "Michal", last_name: "Chen" },
  { id: "p-002", first_name: "Tim", last_name: "Anders" },
  { id: "p-003", first_name: "Sarah", last_name: "Johnson" },
  { id: "p-004", first_name: "Emily", last_name: "Rodriguez" },
  { id: "p-005", first_name: "Marcus", last_name: "Thompson" },
  { id: "p-006", first_name: "David", last_name: "Kim" },
  { id: "p-007", first_name: "Jennifer", last_name: "Davis" },
  { id: "p-008", first_name: "Robert", last_name: "Garcia" },
  { id: "p-009", first_name: "Amanda", last_name: "Foster" },
  { id: "p-010", first_name: "James", last_name: "Wilson" },
  { id: "p-011", first_name: "Lisa", last_name: "Thompson" },
  { id: "p-012", first_name: "Michael", last_name: "Brown" },
];

interface VoiceProviderProps {
  children: React.ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Use refs for values accessed in callbacks to avoid deps changes
  const selectedAppointmentIdRef = React.useRef<string | null>(null);
  const pathnameRef = React.useRef(pathname);

  // Update pathname ref when it changes
  React.useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Initialize voice system and subscribe to store changes - run once on mount
  const initializedRef = React.useRef(false);
  React.useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log("[VoiceProvider] Initializing voice system...");

    // Initialize the voice store using getState() to avoid selector subscriptions
    const store = useVoiceStore.getState();
    store.initialize();
    console.log("[VoiceProvider] Store initialized, isSupported:", store.isSupported);

    // Subscribe to selectedAppointmentId changes
    const unsubscribe = useVoiceStore.subscribe((state) => {
      selectedAppointmentIdRef.current = state.selectedAppointmentId;
    });

    return unsubscribe;
  }, []);

  // Register commands only once on mount
  React.useEffect(() => {
    const deps: CommandDependencies = {
      router: {
        push: router.push,
        replace: router.replace,
        back: router.back,
        forward: router.forward,
      },

      searchPatients: async (query: string) => {
        const normalizedQuery = query.toLowerCase();
        return DEMO_PATIENTS.filter(
          (p) =>
            p.first_name.toLowerCase().includes(normalizedQuery) ||
            p.last_name.toLowerCase().includes(normalizedQuery)
        );
      },

      getNextAppointment: async () => {
        return {
          patientName: "Sarah Chen",
          time: "2:30 PM",
          type: "Follow-up Session",
        };
      },

      getTodayPatientCount: async () => {
        return 8;
      },

      getUrgentItems: async () => {
        return [
          { description: "Review lab results for Marcus Thompson" },
          { description: "Complete prior authorization for Emily Rodriguez" },
        ];
      },

      moveAppointment: async (
        _appointmentId: string,
        _newTime: { hours: number; minutes: number }
      ) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("voice-move-appointment", {
              detail: { appointmentId: _appointmentId, newTime: _newTime },
            })
          );
        }
        return true;
      },

      getSelectedAppointmentId: () => selectedAppointmentIdRef.current,

      getCurrentPage: () => pathnameRef.current,
    };

    const commands = createCommandRegistry(deps);
    console.log("[VoiceProvider] Created", commands.length, "commands");
    voiceEngine.registerCommands(commands);

    // Set up callbacks - use getState() to avoid selector subscriptions
    voiceEngine.setCallbacks({
      onTranscript: (transcript, isFinal) => {
        useVoiceStore.getState().setTranscript(transcript, isFinal);
      },

      onCommand: async (_commandId, response) => {
        console.log("[VoiceProvider] onCommand called:", _commandId, response);
        useVoiceStore.getState().setProcessing(false);
        await useVoiceStore.getState().speak(response);
      },

      onNoMatch: async (transcript) => {
        console.log("[VoiceProvider] onNoMatch called:", transcript);
        useVoiceStore.getState().setProcessing(false);
        if (transcript && transcript.length > 0) {
          await useVoiceStore.getState().speak(FALLBACK_RESPONSE);
        }
      },

      onError: async (error) => {
        useVoiceStore.getState().setProcessing(false);
        console.error("Voice error:", error);
      },

      onListeningChange: (isListening) => {
        // Sync store state with engine state
        const store = useVoiceStore.getState();
        if (!isListening && store.isListening) {
          // Engine stopped but store thinks we're listening - sync it
          store.stopListening();
        }
      },
    });

    return () => {
      voiceEngine.clearCommands();
    };
    // Only run once on mount - router methods are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
