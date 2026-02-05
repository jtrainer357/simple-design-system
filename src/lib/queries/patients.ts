/**
 * Patients Queries
 * Fetches patient data from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import type { Patient, Appointment, OutcomeMeasure, Invoice } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAny = any;

// Communication type for messages
export interface Communication {
  id: string;
  practice_id: string;
  patient_id: string;
  channel: string;
  direction: string;
  sender: string | null;
  recipient: string | null;
  message_body: string | null;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
}

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
    console.error("Failed to fetch patients:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(patientId: string): Promise<Patient | null> {
  const supabase = createClient();

  const { data, error } = await supabase.from("patients").select("*").eq("id", patientId).single();

  if (error) {
    console.error("Failed to fetch patient:", error);
    return null;
  }

  return data;
}

/**
 * Get a patient by external_id (from synthetic data)
 */
export async function getPatientByExternalId(externalId: string): Promise<Patient | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("external_id", externalId)
    .single();

  if (error) {
    console.error("Failed to fetch patient by external ID:", error);
    return null;
  }

  return data;
}

/**
 * Get patient appointments
 */
export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient appointments:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get patient outcome measures
 */
export async function getPatientOutcomeMeasures(patientId: string): Promise<OutcomeMeasure[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("outcome_measures")
    .select("*")
    .eq("patient_id", patientId)
    .order("measurement_date", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient outcome measures:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get patient communications/messages
 */
export async function getPatientMessages(patientId: string): Promise<Communication[]> {
  const supabase = createClient();

  const { data, error } = await (supabase as SupabaseAny)
    .from("communications")
    .select("*")
    .eq("patient_id", patientId)
    .order("sent_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch patient messages:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get patient invoices
 */
export async function getPatientInvoices(patientId: string): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .order("date_of_service", { ascending: false });

  if (error) {
    console.error("Failed to fetch patient invoices:", error);
    throw error;
  }

  return data || [];
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
} | null> {
  const patient = await getPatientById(patientId);
  if (!patient) return null;

  const [appointments, outcomeMeasures, messages, invoices] = await Promise.all([
    getPatientAppointments(patientId),
    getPatientOutcomeMeasures(patientId),
    getPatientMessages(patientId),
    getPatientInvoices(patientId),
  ]);

  return {
    patient,
    appointments,
    outcomeMeasures,
    messages,
    invoices,
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
    console.error("Failed to search patients:", error);
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
    console.error("Failed to fetch high-risk patients:", error);
    throw error;
  }

  return data || [];
}
