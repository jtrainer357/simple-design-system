/**
 * Appointments Queries
 * Fetches appointment data from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import type { Appointment, Patient } from "@/src/lib/supabase/types";

export type AppointmentWithPatient = Appointment & {
  patient: Pick<Patient, "id" | "first_name" | "last_name" | "avatar_url" | "risk_level">;
};

/**
 * Get today's appointments with patient details
 */
export async function getTodayAppointments(practiceId?: string): Promise<AppointmentWithPatient[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0] as string;

  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url,
        risk_level
      )
    `
    )
    .eq("date", today)
    .order("start_time", { ascending: true });

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch today's appointments:", error);
    throw error;
  }

  return (data || []) as AppointmentWithPatient[];
}

/**
 * Get upcoming appointments (next 7 days)
 */
export async function getUpcomingAppointments(
  practiceId?: string,
  days = 7
): Promise<AppointmentWithPatient[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0] as string;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  const endDate = futureDate.toISOString().split("T")[0] as string;

  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url,
        risk_level
      )
    `
    )
    .gte("date", today)
    .lte("date", endDate)
    .eq("status", "Scheduled")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch upcoming appointments:", error);
    throw error;
  }

  return (data || []) as AppointmentWithPatient[];
}

/**
 * Get recent appointments (past 30 days)
 */
export async function getRecentAppointments(
  practiceId?: string,
  days = 30
): Promise<AppointmentWithPatient[]> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0] as string;
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - days);
  const startDate = pastDate.toISOString().split("T")[0] as string;

  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      patient:patients(
        id,
        first_name,
        last_name,
        avatar_url,
        risk_level
      )
    `
    )
    .lt("date", today)
    .gte("date", startDate)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch recent appointments:", error);
    throw error;
  }

  return (data || []) as AppointmentWithPatient[];
}

/**
 * Get appointment statistics
 */
export async function getAppointmentStats(practiceId?: string): Promise<{
  todayCount: number;
  completedToday: number;
  scheduledToday: number;
  noShowsThisWeek: number;
  cancelledThisWeek: number;
}> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0] as string;
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStart = weekAgo.toISOString().split("T")[0] as string;

  // Get today's appointments
  let todayQuery = supabase.from("appointments").select("status").eq("date", today);

  if (practiceId) {
    todayQuery = todayQuery.eq("practice_id", practiceId);
  }

  const { data: todayData } = await todayQuery;

  // Get week's no-shows and cancellations
  let weekQuery = supabase
    .from("appointments")
    .select("status")
    .gte("date", weekStart)
    .lte("date", today)
    .in("status", ["No-Show", "Cancelled"]);

  if (practiceId) {
    weekQuery = weekQuery.eq("practice_id", practiceId);
  }

  const { data: weekData } = await weekQuery;

  const todayAppts = todayData || [];
  const weekAppts = weekData || [];

  return {
    todayCount: todayAppts.length,
    completedToday: todayAppts.filter((a) => a.status === "Completed").length,
    scheduledToday: todayAppts.filter((a) => a.status === "Scheduled").length,
    noShowsThisWeek: weekAppts.filter((a) => a.status === "No-Show").length,
    cancelledThisWeek: weekAppts.filter((a) => a.status === "Cancelled").length,
  };
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "Scheduled" | "Completed" | "No-Show" | "Cancelled"
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("appointments").update({ status }).eq("id", appointmentId);

  if (error) {
    console.error("Failed to update appointment status:", error);
    throw error;
  }
}
