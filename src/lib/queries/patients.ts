/**
 * Patients Queries
 * Fetches patient data from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import type {
  Patient,
  Appointment,
  OutcomeMeasure,
  Message,
  Invoice,
} from "@/src/lib/supabase/types";

/**
 * Get all patients for a practice
 */
export async function getPatients(practiceId?: string): Promise<Patient[]> {
  const supabase = createClient();

  let query = supabase
    .from("patients")
    .select("*")
    .eq("status", "Active")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

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
 * Get patient messages
 */
export async function getPatientMessages(patientId: string): Promise<Message[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("patient_id", patientId)
    .order("timestamp", { ascending: false })
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
  messages: Message[];
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
export async function searchPatients(query: string, practiceId?: string): Promise<Patient[]> {
  const supabase = createClient();

  // Use ilike for case-insensitive search
  let dbQuery = supabase
    .from("patients")
    .select("*")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .eq("status", "Active")
    .order("last_name", { ascending: true })
    .limit(20);

  if (practiceId) {
    dbQuery = dbQuery.eq("practice_id", practiceId);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error("Failed to search patients:", error);
    throw error;
  }

  return data || [];
}

/**
 * Get high-risk patients
 */
export async function getHighRiskPatients(practiceId?: string): Promise<Patient[]> {
  const supabase = createClient();

  let query = supabase
    .from("patients")
    .select("*")
    .eq("risk_level", "high")
    .eq("status", "Active")
    .order("last_name", { ascending: true });

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch high-risk patients:", error);
    throw error;
  }

  return data || [];
}
