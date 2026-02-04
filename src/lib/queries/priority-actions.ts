/**
 * Priority Actions Queries
 * Fetches Claude-generated priority actions from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import type { PriorityAction, PriorityActionWithPatient } from "@/src/lib/supabase/types";

/**
 * Get all pending priority actions for a practice with patient details
 */
export async function getPriorityActions(
  practiceId?: string
): Promise<PriorityActionWithPatient[]> {
  const supabase = createClient();

  let query = supabase
    .from("priority_actions")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        date_of_birth,
        risk_level,
        avatar_url
      )
    `
    )
    .eq("status", "pending")
    .order("urgency", { ascending: true }) // urgent first
    .order("created_at", { ascending: false });

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch priority actions:", error);
    throw error;
  }

  // Sort by urgency priority manually (urgent > high > medium > low)
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return (data || []).sort((a, b) => {
    const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 4;
    const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 4;
    return aOrder - bOrder;
  }) as PriorityActionWithPatient[];
}

/**
 * Get priority actions for a specific patient
 */
export async function getPatientPriorityActions(patientId: string): Promise<PriorityAction[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("priority_actions")
    .select("*")
    .eq("patient_id", patientId)
    .eq("status", "pending")
    .order("urgency", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient priority actions:", error);
    throw error;
  }

  // Sort by urgency priority
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return (data || []).sort((a, b) => {
    const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 4;
    const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 4;
    return aOrder - bOrder;
  });
}

/**
 * Mark a priority action as completed
 */
export async function completeAction(actionId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("priority_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", actionId);

  if (error) {
    console.error("Failed to complete action:", error);
    throw error;
  }
}

/**
 * Mark a priority action as dismissed
 */
export async function dismissAction(actionId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("priority_actions")
    .update({
      status: "dismissed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", actionId);

  if (error) {
    console.error("Failed to dismiss action:", error);
    throw error;
  }
}

/**
 * Complete all pending actions for a patient
 */
export async function completeAllPatientActions(patientId: string): Promise<void> {
  const supabase = createClient();

  // Update priority actions
  const { error: actionsError } = await supabase
    .from("priority_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("patient_id", patientId)
    .eq("status", "pending");

  if (actionsError) {
    console.error("Failed to complete patient actions:", actionsError);
    throw actionsError;
  }

  // Also complete related clinical tasks
  const { error: tasksError } = await supabase
    .from("clinical_tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("patient_id", patientId)
    .eq("status", "pending");

  if (tasksError) {
    console.error("Failed to complete patient tasks:", tasksError);
    throw tasksError;
  }
}

/**
 * Get action counts by urgency
 */
export async function getActionCounts(practiceId?: string): Promise<{
  urgent: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}> {
  const supabase = createClient();

  let query = supabase.from("priority_actions").select("urgency").eq("status", "pending");

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch action counts:", error);
    return { urgent: 0, high: 0, medium: 0, low: 0, total: 0 };
  }

  const counts = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: data?.length || 0,
  };

  data?.forEach((action) => {
    if (action.urgency in counts) {
      counts[action.urgency as keyof typeof counts]++;
    }
  });

  return counts;
}
