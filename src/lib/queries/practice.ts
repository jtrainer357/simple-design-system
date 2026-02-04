/**
 * Practice Queries
 * Fetches practice data and dashboard stats from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import type { Practice } from "@/src/lib/supabase/types";

/**
 * Get the demo practice (first practice in the database)
 */
export async function getDemoPractice(): Promise<Practice | null> {
  const supabase = createClient();

  const { data, error } = await supabase.from("practices").select("*").limit(1).single();

  if (error) {
    console.error("Failed to fetch demo practice:", error);
    return null;
  }

  return data;
}

/**
 * Get practice ID for queries
 */
export async function getPracticeId(): Promise<string | null> {
  const practice = await getDemoPractice();
  return practice?.id || null;
}

/**
 * Get dashboard statistics for a practice
 */
export async function getDashboardStats(practiceId: string): Promise<{
  patientCount: number;
  activePatientCount: number;
  highRiskCount: number;
  todayAppointmentCount: number;
  unreadMessageCount: number;
  pendingActionCount: number;
  outstandingBalance: number;
}> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0] as string;

  // Run all queries in parallel
  const [patientsResult, todayApptsResult, messagesResult, actionsResult, invoicesResult] =
    await Promise.all([
      // Patient counts
      supabase.from("patients").select("status, risk_level").eq("practice_id", practiceId),

      // Today's appointments
      supabase.from("appointments").select("id").eq("practice_id", practiceId).eq("date", today),

      // Unread messages
      supabase
        .from("messages")
        .select("id")
        .eq("practice_id", practiceId)
        .eq("direction", "inbound")
        .eq("read", false),

      // Pending actions
      supabase
        .from("priority_actions")
        .select("id")
        .eq("practice_id", practiceId)
        .eq("status", "pending"),

      // Outstanding balance
      supabase.from("invoices").select("balance").eq("practice_id", practiceId).gt("balance", 0),
    ]);

  const patients = patientsResult.data || [];
  const todayAppts = todayApptsResult.data || [];
  const messages = messagesResult.data || [];
  const actions = actionsResult.data || [];
  const invoices = invoicesResult.data || [];

  return {
    patientCount: patients.length,
    activePatientCount: patients.filter((p) => p.status === "Active").length,
    highRiskCount: patients.filter((p) => p.risk_level === "high").length,
    todayAppointmentCount: todayAppts.length,
    unreadMessageCount: messages.length,
    pendingActionCount: actions.length,
    outstandingBalance: invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0),
  };
}

/**
 * Check if the database has been populated (import has run)
 */
export async function isDatabasePopulated(): Promise<boolean> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Failed to check database population:", error);
    return false;
  }

  return (count || 0) > 0;
}

/**
 * Get recent AI analysis runs
 */
export async function getRecentAnalysisRuns(
  practiceId: string,
  limit = 5
): Promise<
  Array<{
    id: string;
    batch_id: string;
    patients_analyzed: number;
    actions_generated: number;
    duration_seconds: number;
    completed_at: string;
  }>
> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_analysis_runs")
    .select("id, batch_id, patients_analyzed, actions_generated, duration_seconds, completed_at")
    .eq("practice_id", practiceId)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch analysis runs:", error);
    return [];
  }

  return data || [];
}
