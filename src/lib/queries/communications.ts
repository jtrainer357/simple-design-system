/**
 * Communications Queries
 * Fetches patient messages from Supabase
 *
 * Note: The communications table is created by demo migration and
 * not in the generated TypeScript types, so we use explicit typing.
 */

import { createClient } from "@/src/lib/supabase/client";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

export interface Communication {
  id: string;
  practice_id: string;
  patient_id: string;
  channel: string;
  direction: string;
  sender: string | null;
  recipient: string | null;
  sender_email: string | null;
  recipient_email: string | null;
  sender_phone: string | null;
  recipient_phone: string | null;
  message_body: string | null;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface CommunicationWithPatient extends Communication {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

/**
 * Get all communications for a practice
 */
export async function getCommunications(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<CommunicationWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as SupabaseAny)
    .from("communications")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch communications:", error);
    throw error;
  }

  return (data || []) as CommunicationWithPatient[];
}

/**
 * Get communications for a specific patient
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientCommunications(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Communication[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as SupabaseAny)
    .from("communications")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient communications:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get unread communications count
 */
export async function getUnreadCount(practiceId: string = DEMO_PRACTICE_ID): Promise<number> {
  const supabase = createClient();

  const { count, error } = await (supabase as SupabaseAny)
    .from("communications")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", practiceId)
    .eq("direction", "inbound")
    .eq("is_read", false);

  if (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark a communication as read
 * @param communicationId - The communication's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function markAsRead(
  communicationId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  const { error } = await (supabase as SupabaseAny)
    .from("communications")
    .update({ is_read: true })
    .eq("id", communicationId)
    .eq("practice_id", practiceId);

  if (error) {
    console.error("Failed to mark communication as read:", error);
    throw error;
  }
}

/**
 * Get communications grouped by patient (for thread view)
 */
export async function getCommunicationThreads(practiceId: string = DEMO_PRACTICE_ID): Promise<
  Array<{
    patient: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
    };
    messages: Communication[];
    unreadCount: number;
    lastMessage: Communication | null;
  }>
> {
  const supabase = createClient();

  // Get all communications with patient info
  const { data, error } = await (supabase as SupabaseAny)
    .from("communications")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq("practice_id", practiceId)
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch communications:", error);
    throw error;
  }

  // Group by patient
  const patientMap = new Map<
    string,
    {
      patient: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string | null;
      };
      messages: Communication[];
      unreadCount: number;
    }
  >();

  ((data || []) as SupabaseAny[]).forEach((comm: SupabaseAny) => {
    const patientId = comm.patient_id;
    if (!patientMap.has(patientId)) {
      patientMap.set(patientId, {
        patient: comm.patient as {
          id: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
        },
        messages: [],
        unreadCount: 0,
      });
    }

    const thread = patientMap.get(patientId)!;
    thread.messages.push(comm as Communication);
    if (!comm.is_read && comm.direction === "inbound") {
      thread.unreadCount++;
    }
  });

  // Convert to array and add lastMessage
  return Array.from(patientMap.values())
    .map((thread) => ({
      ...thread,
      lastMessage: thread.messages[0] || null,
    }))
    .sort((a, b) => {
      const aTime = a.lastMessage?.sent_at || "";
      const bTime = b.lastMessage?.sent_at || "";
      return bTime.localeCompare(aTime);
    });
}
