/**
 * Priority Actions Queries
 * Fetches Claude-generated priority actions from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type { PriorityActionWithPatient, PriorityAction, Patient } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

const log = createLogger("queries/priority-actions");

// Type for priority action with patient relation from DB (raw form before mapping)
type PriorityActionWithPatientRow = PriorityAction & {
  patient: Pick<
    Patient,
    "id" | "first_name" | "last_name" | "date_of_birth" | "risk_level" | "avatar_url"
  >;
};

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

  const { data, error } = await supabase
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
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to fetch priority actions", error, {
      action: "getPriorityActions",
      practiceId,
    });
    throw error;
  }

  // Map DB fields to expected types and sort by urgency
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const actions = (data || []) as unknown as PriorityActionWithPatientRow[];
  return actions
    .filter((action) => {
      // Filter out Emily Chen's card
      const patient = action.patient;
      if (patient?.first_name === "Emily" && patient?.last_name === "Chen") {
        return false;
      }
      return true;
    })
    .map((action) => ({
      ...action,
      urgency: normalizeUrgency(action.urgency || "medium"),
      confidence_score: action.confidence_score || 85,
      timeframe: action.timeframe || "This week",
      status: action.status || "pending",
    }))
    .sort((a, b) => {
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
  suggested_actions: unknown;
  status: string;
  created_at: string;
}

/**
 * Get priority actions for a specific patient
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientPriorityActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<PatientPriorityAction[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("priority_actions")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient priority actions", error, {
      action: "getPatientPriorityActions",
      patientId,
    });
    throw error;
  }

  // Map DB fields and sort by urgency priority
  const urgencyOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const actions = (data || []) as unknown as PriorityAction[];
  return actions
    .map((action) => ({
      id: action.id,
      practice_id: action.practice_id,
      patient_id: action.patient_id,
      title: action.title,
      urgency: normalizeUrgency(action.urgency || "medium"),
      timeframe: action.timeframe || "This week",
      confidence_score: action.confidence_score || 85,
      clinical_context: action.clinical_context,
      suggested_actions: action.suggested_actions,
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
 * @param actionId - The action's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function completeAction(
  actionId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("priority_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to complete action", error, { action: "completeAction", actionId });
    throw error;
  }
}

/**
 * Mark a priority action as dismissed
 * @param actionId - The action's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function dismissAction(
  actionId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("priority_actions")
    .update({
      status: "dismissed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to dismiss action", error, { action: "dismissAction", actionId });
    throw error;
  }
}

/**
 * Complete all pending actions for a patient
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function completeAllPatientActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<void> {
  const supabase = createClient();

  // Update priority actions
  const { error: actionsError } = await supabase
    .from("priority_actions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null");

  if (actionsError) {
    log.error("Failed to complete patient actions", actionsError, {
      action: "completeAllPatientActions",
      patientId,
    });
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
    .eq("practice_id", practiceId)
    .eq("status", "pending");

  if (tasksError) {
    log.error("Failed to complete patient tasks", tasksError, {
      action: "completeAllPatientActions",
      patientId,
    });
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

  const { data, error } = await supabase
    .from("priority_actions")
    .select("urgency")
    .eq("practice_id", practiceId)
    .or("status.eq.pending,status.is.null");

  if (error) {
    log.error("Failed to fetch action counts", error, { action: "getActionCounts", practiceId });
    return { urgent: 0, high: 0, medium: 0, low: 0, total: 0 };
  }

  const actions = (data || []) as Array<{ urgency: string }>;
  const counts = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: actions.length,
  };

  actions.forEach((action) => {
    const normalized = normalizeUrgency(action.urgency || "medium");
    counts[normalized]++;
  });

  return counts;
}
