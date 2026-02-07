/**
 * Patients Queries
 * Fetches patient data from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type {
  Patient,
  Appointment,
  OutcomeMeasure,
  Invoice,
  Review,
  Communication,
  VisitSummary,
} from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

const log = createLogger("queries/patients");

// Re-export Communication type for backwards compatibility
export type { Communication };

/**
 * Get all patients for a practice
 */
export async function getPatients(practiceId: string = DEMO_PRACTICE_ID): Promise<Patient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("status", "Active")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (error) {
    log.error("Failed to fetch patients", error, { action: "getPatients" });
    throw error;
  }

  return data || [];
}

/**
 * Get a single patient by ID
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientById(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .eq("practice_id", practiceId)
    .single();

  if (error) {
    log.error("Failed to fetch patient", error, { action: "getPatientById", patientId });
    return null;
  }

  return data;
}

/**
 * Get a patient by external_id (from synthetic data)
 * @param externalId - The external patient ID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientByExternalId(
  externalId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("external_id", externalId)
    .eq("practice_id", practiceId)
    .single();

  if (error) {
    log.error("Failed to fetch patient by external ID", error, {
      action: "getPatientByExternalId",
      externalId,
    });
    return null;
  }

  return data;
}

/**
 * Get patient appointments
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientAppointments(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Appointment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient appointments", error, {
      action: "getPatientAppointments",
      patientId,
    });
    throw error;
  }

  return data || [];
}

/**
 * Get patient outcome measures
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientOutcomeMeasures(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<OutcomeMeasure[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("outcome_measures")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("measurement_date", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient outcome measures", error, {
      action: "getPatientOutcomeMeasures",
      patientId,
    });
    throw error;
  }

  return data || [];
}

/**
 * Get patient communications/messages
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientMessages(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Communication[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("communications")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) {
    log.error("Failed to fetch patient messages", error, {
      action: "getPatientMessages",
      patientId,
    });
    throw error;
  }

  return (data || []) as Communication[];
}

/**
 * Get patient invoices
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientInvoices(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("date_of_service", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient invoices", error, {
      action: "getPatientInvoices",
      patientId,
    });
    throw error;
  }

  return data || [];
}

/**
 * Get patient reviews
 * Returns empty array if table doesn't exist or query fails (graceful degradation)
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientReviews(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Review[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .order("review_date", { ascending: false });

    if (error) {
      // Table might not exist yet - return empty array gracefully
      log.warn("Reviews query failed (table may not exist)", {
        action: "getPatientReviews",
        patientId,
        errorMessage: error.message,
      });
      return [];
    }

    return data || [];
  } catch {
    // Graceful fallback if table doesn't exist
    return [];
  }
}

/**
 * Get complete patient details with all related data
 */
export async function getPatientDetails(patientId: string): Promise<{
  patient: Patient;
  appointments: Appointment[];
  outcomeMeasures: OutcomeMeasure[];
  messages: Communication[];
  invoices: Invoice[];
  reviews: Review[];
} | null> {
  const patient = await getPatientById(patientId);
  if (!patient) return null;

  const [appointments, outcomeMeasures, messages, invoices, reviews] = await Promise.all([
    getPatientAppointments(patientId),
    getPatientOutcomeMeasures(patientId),
    getPatientMessages(patientId),
    getPatientInvoices(patientId),
    getPatientReviews(patientId),
  ]);

  return {
    patient,
    appointments,
    outcomeMeasures,
    messages,
    invoices,
    reviews,
  };
}

/**
 * Search patients by name
 */
export async function searchPatients(
  query: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient[]> {
  const supabase = createClient();

  // Use ilike for case-insensitive search
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("practice_id", practiceId)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .eq("status", "Active")
    .order("last_name", { ascending: true })
    .limit(20);

  if (error) {
    log.error("Failed to search patients", error, { action: "searchPatients", query });
    throw error;
  }

  return data || [];
}

/**
 * Get high-risk patients
 */
export async function getHighRiskPatients(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Patient[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("risk_level", "high")
    .eq("status", "Active")
    .order("last_name", { ascending: true });

  if (error) {
    log.error("Failed to fetch high-risk patients", error, { action: "getHighRiskPatients" });
    throw error;
  }

  return data || [];
}

// Re-export VisitSummary type for backwards compatibility
export type { VisitSummary };

/**
 * Get patient visit summaries for recent activity
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientVisitSummaries(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<VisitSummary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("visit_summaries")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("visit_date", { ascending: false })
    .limit(10);

  if (error) {
    log.error("Failed to fetch patient visit summaries", error, {
      action: "getPatientVisitSummaries",
      patientId,
    });
    return [];
  }

  return (data || []) as VisitSummary[];
}
