/**
 * Synthetic Data Adapter
 * Converts TypeScript synthetic data to Supabase database types
 * Allows UI to use demo data without running SQL migrations
 */

import { SYNTHETIC_PATIENTS, type SyntheticPatient } from "./synthetic-patients";
import { SYNTHETIC_APPOINTMENTS, type SyntheticAppointment } from "./synthetic-appointments";
import {
  SYNTHETIC_OUTCOME_MEASURES,
  type OutcomeMeasure as SyntheticOutcomeMeasure,
} from "./synthetic-outcome-measures";
import { SYNTHETIC_MESSAGES, type Message as SyntheticMessage } from "./synthetic-messages";
import { SYNTHETIC_INVOICES, type Invoice as SyntheticInvoice } from "./synthetic-billing";
import SYNTHETIC_PRIORITY_ACTIONS, {
  type SyntheticPriorityAction,
} from "./synthetic-priority-actions";
import type {
  Patient,
  Appointment,
  OutcomeMeasure,
  Message,
  Invoice,
} from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

// Generate deterministic UUID from string (simple hash-based approach)
function generateDemoUUID(seed: string): string {
  // Create a deterministic UUID-like string from the seed
  // Format: 8-4-4-4-12 hex chars
  const hash = seed.split("").reduce((acc, char, i) => {
    return acc + char.charCodeAt(0) * (i + 1);
  }, 0);

  const hex = (num: number, len: number) =>
    Math.abs(num).toString(16).padStart(len, "0").slice(0, len);

  return [
    hex(hash, 8),
    hex(hash * 2, 4),
    "4" + hex(hash * 3, 3), // Version 4
    hex((hash % 4) + 8, 1) + hex(hash * 4, 3), // Variant
    hex(hash * 5, 12),
  ].join("-");
}

/**
 * Convert synthetic patient to database Patient type
 */
export function syntheticPatientToDb(patient: SyntheticPatient): Patient {
  return {
    id: generateDemoUUID(patient.id),
    practice_id: DEMO_PRACTICE_ID,
    external_id: patient.id,
    client_id: patient.client_id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    date_of_birth: patient.date_of_birth,
    gender: patient.gender,
    email: patient.email,
    phone_mobile: patient.phone_mobile,
    phone_home: patient.phone_home || null,
    address_street: patient.address_street,
    address_city: patient.address_city,
    address_state: patient.address_state,
    address_zip: patient.address_zip,
    insurance_provider: patient.insurance_provider,
    insurance_member_id: patient.insurance_member_id,
    primary_diagnosis_code: patient.primary_diagnosis_code,
    primary_diagnosis_name: patient.primary_diagnosis_name,
    secondary_diagnosis_code: patient.secondary_diagnosis_code || null,
    risk_level: patient.risk_level,
    medications: patient.medications || null,
    treatment_start_date: patient.treatment_start_date,
    provider: patient.provider,
    status: patient.status,
    avatar_url: patient.avatar_url,
    created_at: patient.date_created + "T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convert synthetic appointment to database Appointment type
 */
export function syntheticAppointmentToDb(
  apt: SyntheticAppointment,
  patientUUID: string
): Appointment {
  return {
    id: generateDemoUUID(apt.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    external_id: apt.id,
    date: apt.date,
    start_time: apt.start_time,
    end_time: apt.end_time,
    duration_minutes: apt.duration_minutes,
    status: apt.status,
    service_type: apt.service_type,
    cpt_code: apt.cpt_code,
    location: apt.location,
    notes: apt.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Convert synthetic outcome measure to database OutcomeMeasure type
 */
export function syntheticOutcomeMeasureToDb(
  measure: SyntheticOutcomeMeasure,
  patientUUID: string
): OutcomeMeasure {
  return {
    id: generateDemoUUID(measure.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    measure_type: measure.measure_type,
    score: measure.score,
    max_score: measure.max_score,
    measurement_date: measure.measurement_date,
    administered_by: measure.administered_by,
    notes: null,
    created_at: measure.measurement_date + "T00:00:00Z",
  };
}

/**
 * Convert synthetic message to database Message type
 */
export function syntheticMessageToDb(msg: SyntheticMessage, patientUUID: string): Message {
  return {
    id: generateDemoUUID(msg.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    direction: msg.direction,
    channel: msg.channel,
    content: msg.content,
    timestamp: msg.timestamp,
    read: msg.read,
    read_at: msg.read ? msg.timestamp : null,
    created_at: msg.timestamp,
  };
}

/**
 * Convert synthetic invoice to database Invoice type
 */
export function syntheticInvoiceToDb(
  inv: SyntheticInvoice,
  patientUUID: string,
  appointmentUUID: string | null
): Invoice {
  return {
    id: generateDemoUUID(inv.id),
    practice_id: DEMO_PRACTICE_ID,
    patient_id: patientUUID,
    appointment_id: appointmentUUID,
    external_id: inv.id,
    date_of_service: inv.date_of_service,
    cpt_code: inv.cpt_code,
    charge_amount: inv.charge_amount,
    insurance_paid: inv.insurance_paid,
    patient_responsibility: inv.patient_responsibility,
    patient_paid: inv.patient_paid,
    balance: inv.balance,
    status: inv.status,
    created_at: inv.date_of_service + "T00:00:00Z",
    updated_at: new Date().toISOString(),
  };
}

// Cache for converted patients (keyed by external_id)
const patientCache = new Map<string, Patient>();

/**
 * Get all demo patients converted to database format
 */
export function getDemoPatients(): Patient[] {
  // Filter to only get the 10 comprehensive demo patients
  const demoPatients = SYNTHETIC_PATIENTS.filter((p) => p.id.endsWith("-demo"));

  return demoPatients.map((p) => {
    if (!patientCache.has(p.id)) {
      patientCache.set(p.id, syntheticPatientToDb(p));
    }
    return patientCache.get(p.id)!;
  });
}

/**
 * Get patient UUID from external ID
 */
export function getPatientUUID(externalId: string): string {
  const cached = patientCache.get(externalId);
  if (cached) return cached.id;
  return generateDemoUUID(externalId);
}

/**
 * Get demo patient by external ID
 */
export function getDemoPatientByExternalId(externalId: string): Patient | null {
  const patient = SYNTHETIC_PATIENTS.find((p) => p.id === externalId);
  if (!patient) return null;

  if (!patientCache.has(externalId)) {
    patientCache.set(externalId, syntheticPatientToDb(patient));
  }
  return patientCache.get(externalId)!;
}

/**
 * Get demo patient by UUID
 */
export function getDemoPatientByUUID(uuid: string): Patient | null {
  // Check cache first
  for (const [, patient] of patientCache) {
    if (patient.id === uuid) return patient;
  }

  // Generate and check all demo patients
  const demoPatients = getDemoPatients();
  return demoPatients.find((p) => p.id === uuid) || null;
}

/**
 * Get appointments for a demo patient
 */
export function getDemoPatientAppointments(patientExternalId: string): Appointment[] {
  const patientUUID = getPatientUUID(patientExternalId);

  return SYNTHETIC_APPOINTMENTS.filter((apt) => apt.patient_id === patientExternalId)
    .map((apt) => syntheticAppointmentToDb(apt, patientUUID))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.start_time.localeCompare(a.start_time);
    });
}

/**
 * Get outcome measures for a demo patient
 */
export function getDemoPatientOutcomeMeasures(patientExternalId: string): OutcomeMeasure[] {
  const patientUUID = getPatientUUID(patientExternalId);

  return SYNTHETIC_OUTCOME_MEASURES.filter((m) => m.patient_id === patientExternalId)
    .map((m) => syntheticOutcomeMeasureToDb(m, patientUUID))
    .sort((a, b) => b.measurement_date.localeCompare(a.measurement_date));
}

/**
 * Get messages for a demo patient
 */
export function getDemoPatientMessages(patientExternalId: string): Message[] {
  const patientUUID = getPatientUUID(patientExternalId);

  return SYNTHETIC_MESSAGES.filter((m) => m.patient_id === patientExternalId)
    .map((m) => syntheticMessageToDb(m, patientUUID))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Get invoices for a demo patient
 */
export function getDemoPatientInvoices(patientExternalId: string): Invoice[] {
  const patientUUID = getPatientUUID(patientExternalId);

  return SYNTHETIC_INVOICES.filter((inv) => inv.patient_id === patientExternalId)
    .map((inv) => {
      // Find appointment UUID if available
      const apt = SYNTHETIC_APPOINTMENTS.find((a) => a.id === inv.appointment_id);
      const aptUUID = apt ? generateDemoUUID(apt.id) : null;
      return syntheticInvoiceToDb(inv, patientUUID, aptUUID);
    })
    .sort((a, b) => b.date_of_service.localeCompare(a.date_of_service));
}

/**
 * Get priority actions for a demo patient
 */
export function getDemoPatientPriorityActions(patientExternalId: string) {
  return SYNTHETIC_PRIORITY_ACTIONS.filter((a) => a.patient_id === patientExternalId);
}

/**
 * Check if a patient ID is a demo patient UUID
 */
export function isDemoPatientUUID(uuid: string): boolean {
  return getDemoPatientByUUID(uuid) !== null;
}

/**
 * Get external ID from UUID (for demo patients)
 */
export function getExternalIdFromUUID(uuid: string): string | null {
  const patient = getDemoPatientByUUID(uuid);
  return patient?.external_id || null;
}

/**
 * Get today's demo appointments with patient details (for dashboard)
 * Returns appointments for DEMO_DATE with full patient info attached
 */
export function getDemoTodayAppointments(): Array<
  Appointment & {
    patient: Pick<
      Patient,
      "id" | "first_name" | "last_name" | "avatar_url" | "risk_level" | "date_of_birth"
    >;
  }
> {
  const { DEMO_DATE } = require("@/src/lib/utils/demo-date");

  // Get all demo appointments for today
  const todayAppointments = SYNTHETIC_APPOINTMENTS.filter(
    (apt) => apt.date === DEMO_DATE && apt.patient_id.endsWith("-demo")
  );

  return todayAppointments
    .map((apt) => {
      const patientUUID = getPatientUUID(apt.patient_id);
      const patient = getDemoPatientByExternalId(apt.patient_id);

      return {
        ...syntheticAppointmentToDb(apt, patientUUID),
        patient: {
          id: patient?.id || patientUUID,
          first_name: patient?.first_name || apt.patient_name.split(" ")[0] || "",
          last_name: patient?.last_name || apt.patient_name.split(" ").slice(1).join(" ") || "",
          avatar_url: patient?.avatar_url || null,
          risk_level: patient?.risk_level || "low",
          date_of_birth: patient?.date_of_birth || "1990-01-01",
        },
      };
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}
