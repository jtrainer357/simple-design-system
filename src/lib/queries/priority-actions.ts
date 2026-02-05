/**
 * Priority Actions Queries
 * Fetches Claude-generated priority actions from Supabase
 *
 * Note: Demo uses "prioritized_actions" table which is not in generated types.
 */

import { createClient } from "@/src/lib/supabase/client";
import type { PriorityActionWithPatient } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

// Map urgency from uppercase (DB) to lowercase (types)
function normalizeUrgency(urgency: string): "urgent" | "high" | "medium" | "low" {
  const lower = urgency.toLowerCase();
  if (lower === "urgent") return "urgent";
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  return "low";
}

/**
 * Get all pending priority actions for a practice with patient details
 */
export async function getPriorityActions(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<PriorityActionWithPatient[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as SupabaseAny)
    .from("prioritized_actions")
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
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch priority actions:", error);
    throw error;
  }

  // Map DB fields to expected types and sort by urgency
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return ((data || []) as SupabaseAny[])
    .map((action: SupabaseAny) => ({
      ...action,
      urgency: normalizeUrgency(action.urgency || "medium"),
      confidence_score: action.ai_confidence || 85,
      timeframe: action.time_window || "This week",
      status: action.status || "pending",
    }))
    .sort((a: SupabaseAny, b: SupabaseAny) => {
      const aOrder = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 4;
      const bOrder = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 4;
      return aOrder - bOrder;
    }) as PriorityActionWithPatient[];
}

// PriorityAction type for patient-specific queries
export interface PatientPriorityAction {
  id: string;
  practice_id: string;
  patient_id: string;
  title: string;
  urgency: "urgent" | "high" | "medium" | "low";
  timeframe: string | null;
  confidence_score: number | null;
  clinical_context: string | null;
  suggested_actions: string[] | null;
  status: string;
  created_at: string;
}

/**
 * Get priority actions for a specific patient
 */
export async function getPatientPriorityActions(
  patientId: string
): Promise<PatientPriorityAction[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as SupabaseAny)
    .from("prioritized_actions")
    .select("*")
    .eq("patient_id", patientId)
    .or("status.eq.pending,status.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient priority actions:", error);
    throw error;
  }

  // Map DB fields and sort by urgency priority
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return ((data || []) as SupabaseAny[])
    .map((action: SupabaseAny) => ({
      id: action.id,
      practice_id: action.practice_id,
      patient_id: action.patient_id,
      title: action.title,
      urgency: normalizeUrgency(action.urgency || "medium"),
      timeframe: action.time_window || "This week",
      confidence_score: action.ai_confidence || 85,
      clinical_context: action.clinical_context,
      suggested_actions: action.suggested_actions as string[] | null,
      status: action.status || "pending",
      created_at: action.created_at,
    }))
    .sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency] ?? 4;
      const bOrder = urgencyOrder[b.urgency] ?? 4;
      return aOrder - bOrder;
    });
}

/**
 * Mark a priority action as completed
 */
export async function completeAction(actionId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await (supabase as SupabaseAny)
    .from("prioritized_actions")
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

  const { error } = await (supabase as SupabaseAny)
    .from("prioritized_actions")
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
  const { error: actionsError } = await (supabase as SupabaseAny)
    .from("prioritized_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("patient_id", patientId)
    .or("status.eq.pending,status.is.null");

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
export async function getActionCounts(practiceId: string = DEMO_PRACTICE_ID): Promise<{
  urgent: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}> {
  const supabase = createClient();

  const { data, error } = await (supabase as SupabaseAny)
    .from("prioritized_actions")
    .select("urgency")
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null");

  if (error) {
    console.error("Failed to fetch action counts:", error);
    return { urgent: 0, high: 0, medium: 0, low: 0, total: 0 };
  }

  const counts = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: (data as SupabaseAny[])?.length || 0,
  };

  ((data || []) as SupabaseAny[]).forEach((action: SupabaseAny) => {
    const normalized = normalizeUrgency(action.urgency || "medium");
    counts[normalized]++;
  });

  return counts;
}
