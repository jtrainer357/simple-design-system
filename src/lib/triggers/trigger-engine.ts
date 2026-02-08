/**
 * Trigger Detection Engine
 * Scans the database for clinical triggers and generates trigger contexts.
 *
 * @module triggers/trigger-engine
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import { getDemoTodayDate, getDemoDaysAgo, DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import {
  TriggerEvent,
  UrgencyLevel,
  TriggerContext,
  UnsignedNoteData,
  AppointmentMissedData,
  MedicationRefillData,
  InsuranceAuthData,
  PatientNotSeenData,
  OutcomeScoreData,
  NewPatientIntakeData,
  CLINICAL_THRESHOLDS,
  getOutcomeSeverity,
  getUrgencyFromOutcomeScore,
} from "./trigger-types";

const log = createLogger("triggers/engine");

/**
 * Result of a trigger detection scan
 */
export interface TriggerScanResult {
  practice_id: string;
  triggers: TriggerContext[];
  scan_started_at: string;
  scan_completed_at: string;
  duration_ms: number;
  trigger_counts: Record<TriggerEvent, number>;
}

/**
 * Detect all triggers for a practice
 */
export async function detectTriggers(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<TriggerContext[]> {
  const startTime = Date.now();
  log.info("Starting trigger detection scan", { practiceId });

  const allTriggers: TriggerContext[] = [];

  // Run all trigger detectors in parallel
  const [
    unsignedNotes,
    missedAppointments,
    medicationRefills,
    expiringAuth,
    patientsNotSeen,
    elevatedScores,
    newPatientIntakes,
  ] = await Promise.allSettled([
    detectUnsignedNotes(practiceId),
    detectMissedAppointments(practiceId),
    detectMedicationRefills(practiceId),
    detectExpiringAuthorizations(practiceId),
    detectPatientsNotSeen(practiceId),
    detectElevatedScores(practiceId),
    detectNewPatientIntakes(practiceId),
  ]);

  // Collect successful results
  const collectResults = (result: PromiseSettledResult<TriggerContext[]>, name: string) => {
    if (result.status === "fulfilled") {
      allTriggers.push(...result.value);
      log.debug(`${name} detector found ${result.value.length} triggers`);
    } else {
      log.error(`${name} detector failed`, result.reason);
    }
  };

  collectResults(unsignedNotes, "UnsignedNotes");
  collectResults(missedAppointments, "MissedAppointments");
  collectResults(medicationRefills, "MedicationRefills");
  collectResults(expiringAuth, "ExpiringAuth");
  collectResults(patientsNotSeen, "PatientsNotSeen");
  collectResults(elevatedScores, "ElevatedScores");
  collectResults(newPatientIntakes, "NewPatientIntakes");

  const duration = Date.now() - startTime;
  log.info(`Trigger scan complete: ${allTriggers.length} triggers in ${duration}ms`, {
    practiceId,
    triggerCount: allTriggers.length,
  });

  return allTriggers;
}

/**
 * Detect UNSIGNED_NOTE_AGING triggers
 * Sessions in draft status for more than 24 hours
 */
async function detectUnsignedNotes(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const now = getDemoTodayDate();
  const triggers: TriggerContext[] = [];

  // Query for draft sessions (using appointments as proxy - looking for completed but no signed note)
  // In a real implementation, this would query a sessions/notes table
  // For demo, we'll query appointments that are completed but check for unsigned notes pattern
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      patient_id,
      date,
      start_time,
      service_type,
      patients!inner(
        id,
        first_name,
        last_name
      )
    `
    )
    .eq("practice_id", practiceId)
    .eq("status", "Completed")
    .lt("date", getDemoDaysAgo(1)) // At least 24 hours ago
    .gt("date", getDemoDaysAgo(7)) // Within last 7 days
    .order("date", { ascending: false });

  if (error) {
    log.error("Failed to query unsigned notes", error);
    return triggers;
  }

  // For demo purposes, consider ~20% of completed sessions as having unsigned notes
  const appointmentsWithUnsigned = (appointments || []).filter((_, i) => i % 5 === 0);

  for (const apt of appointmentsWithUnsigned) {
    const patient = apt.patients as unknown as {
      id: string;
      first_name: string;
      last_name: string;
    };
    const sessionDate = new Date(apt.date);
    const hoursSince = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));

    // Determine urgency based on hours
    let urgency: UrgencyLevel;
    if (hoursSince >= 72) {
      urgency = UrgencyLevel.URGENT;
    } else if (hoursSince >= 48) {
      urgency = UrgencyLevel.HIGH;
    } else {
      urgency = UrgencyLevel.MEDIUM;
    }

    const data: UnsignedNoteData = {
      session_id: apt.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      patient_id: patient.id,
      hours_since_session: hoursSince,
      session_date: apt.date,
      session_type: apt.service_type,
    };

    triggers.push({
      event: TriggerEvent.UNSIGNED_NOTE_AGING,
      patient_id: patient.id,
      practice_id: practiceId,
      data,
      triggered_at: new Date().toISOString(),
      urgency,
    });
  }

  return triggers;
}

/**
 * Detect APPOINTMENT_MISSED triggers
 * No-show appointments in the last 7 days
 */
async function detectMissedAppointments(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const triggers: TriggerContext[] = [];

  const { data: noShows, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      patient_id,
      date,
      start_time,
      service_type,
      patients!inner(
        id,
        first_name,
        last_name
      )
    `
    )
    .eq("practice_id", practiceId)
    .eq("status", "No-Show")
    .gte("date", getDemoDaysAgo(7))
    .order("date", { ascending: false });

  if (error) {
    log.error("Failed to query missed appointments", error);
    return triggers;
  }

  // Get 30-day no-show counts per patient
  const patientNoShowCounts: Record<string, number> = {};
  const { data: allNoShows } = await supabase
    .from("appointments")
    .select("patient_id")
    .eq("practice_id", practiceId)
    .eq("status", "No-Show")
    .gte("date", getDemoDaysAgo(30));

  (allNoShows || []).forEach((ns) => {
    patientNoShowCounts[ns.patient_id] = (patientNoShowCounts[ns.patient_id] || 0) + 1;
  });

  for (const apt of noShows || []) {
    const patient = apt.patients as unknown as {
      id: string;
      first_name: string;
      last_name: string;
    };

    const data: AppointmentMissedData = {
      appointment_id: apt.id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      patient_id: patient.id,
      appointment_date: apt.date,
      appointment_time: apt.start_time,
      no_show_count_30_days: patientNoShowCounts[patient.id] || 1,
      service_type: apt.service_type,
    };

    triggers.push({
      event: TriggerEvent.APPOINTMENT_MISSED,
      patient_id: patient.id,
      practice_id: practiceId,
      data,
      triggered_at: new Date().toISOString(),
      urgency: UrgencyLevel.HIGH, // Always high for missed appointments
    });
  }

  return triggers;
}

/**
 * Detect MEDICATION_REFILL_APPROACHING triggers
 * Medications due for refill in the next 7 days
 */
async function detectMedicationRefills(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const triggers: TriggerContext[] = [];

  // Query patients with medications (stored as array in patients table)
  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, medications, treatment_start_date")
    .eq("practice_id", practiceId)
    .eq("status", "Active")
    .not("medications", "is", null);

  if (error) {
    log.error("Failed to query medications", error);
    return triggers;
  }

  const now = getDemoTodayDate();

  for (const patient of patients || []) {
    const medications = patient.medications || [];

    // Simulate refill dates based on treatment start (monthly refills)
    for (const med of medications) {
      // Parse medication string (e.g., "Sertraline 100mg")
      const medParts = med.split(" ");
      const medName = medParts[0] || med;
      const dosage = medParts.slice(1).join(" ") || "";

      // Calculate next refill (simulate based on treatment start)
      if (patient.treatment_start_date) {
        const startDate = new Date(patient.treatment_start_date);
        // Find next monthly refill from start date
        const refillDate = new Date(startDate);
        while (refillDate < now) {
          refillDate.setMonth(refillDate.getMonth() + 1);
        }

        const daysUntil = Math.floor(
          (refillDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only trigger if within 7 days
        if (daysUntil >= 0 && daysUntil <= 7) {
          const urgency = daysUntil <= 3 ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM;

          const data: MedicationRefillData = {
            medication_name: medName,
            dosage: dosage,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            patient_id: patient.id,
            refill_date: refillDate.toISOString().split("T")[0]!,
            days_until_refill: daysUntil,
          };

          triggers.push({
            event: TriggerEvent.MEDICATION_REFILL_APPROACHING,
            patient_id: patient.id,
            practice_id: practiceId,
            data,
            triggered_at: new Date().toISOString(),
            urgency,
          });

          // Only one medication trigger per patient for now
          break;
        }
      }
    }
  }

  return triggers;
}

/**
 * Detect INSURANCE_AUTH_EXPIRING triggers
 * Authorizations expiring in the next 14 days
 */
async function detectExpiringAuthorizations(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const triggers: TriggerContext[] = [];

  // Query patients with insurance info
  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, insurance_provider, treatment_start_date")
    .eq("practice_id", practiceId)
    .eq("status", "Active")
    .not("insurance_provider", "is", null);

  if (error) {
    log.error("Failed to query insurance authorizations", error);
    return triggers;
  }

  const now = getDemoTodayDate();

  for (const patient of patients || []) {
    // Simulate authorization expiry (quarterly from treatment start)
    if (patient.treatment_start_date) {
      const startDate = new Date(patient.treatment_start_date);
      const expiryDate = new Date(startDate);
      while (expiryDate < now) {
        expiryDate.setMonth(expiryDate.getMonth() + 3); // Quarterly auth
      }

      const daysUntil = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Only trigger if within 14 days
      if (daysUntil >= 0 && daysUntil <= 14) {
        const urgency = daysUntil <= 7 ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM;
        // Simulate sessions remaining (randomish based on days)
        const sessionsRemaining = Math.max(1, Math.floor(daysUntil / 2));

        const data: InsuranceAuthData = {
          patient_name: `${patient.first_name} ${patient.last_name}`,
          patient_id: patient.id,
          sessions_remaining: sessionsRemaining,
          expiry_date: expiryDate.toISOString().split("T")[0]!,
          days_until_expiry: daysUntil,
          insurance_provider: patient.insurance_provider || "Unknown",
        };

        triggers.push({
          event: TriggerEvent.INSURANCE_AUTH_EXPIRING,
          patient_id: patient.id,
          practice_id: practiceId,
          data,
          triggered_at: new Date().toISOString(),
          urgency,
        });
      }
    }
  }

  return triggers;
}

/**
 * Detect PATIENT_NOT_SEEN triggers
 * Active patients not seen in 21+ days
 */
async function detectPatientsNotSeen(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const triggers: TriggerContext[] = [];

  // Get active patients
  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, risk_level, primary_diagnosis_name")
    .eq("practice_id", practiceId)
    .eq("status", "Active");

  if (error) {
    log.error("Failed to query patients", error);
    return triggers;
  }

  const now = getDemoTodayDate();
  const cutoffDate21 = getDemoDaysAgo(21);

  for (const patient of patients || []) {
    // Get most recent completed appointment
    const { data: lastApt } = await supabase
      .from("appointments")
      .select("date")
      .eq("patient_id", patient.id)
      .eq("status", "Completed")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (lastApt) {
      const lastVisitDate = new Date(lastApt.date);
      const daysSince = Math.floor(
        (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince >= 21) {
        const urgency = daysSince >= 30 ? UrgencyLevel.HIGH : UrgencyLevel.MEDIUM;

        const data: PatientNotSeenData = {
          patient_name: `${patient.first_name} ${patient.last_name}`,
          patient_id: patient.id,
          days_since_last_visit: daysSince,
          last_appointment_date: lastApt.date,
          risk_level: patient.risk_level || undefined,
          primary_diagnosis: patient.primary_diagnosis_name || undefined,
        };

        triggers.push({
          event: TriggerEvent.PATIENT_NOT_SEEN,
          patient_id: patient.id,
          practice_id: practiceId,
          data,
          triggered_at: new Date().toISOString(),
          urgency,
        });
      }
    }
  }

  return triggers;
}

/**
 * Detect OUTCOME_SCORE_ELEVATED triggers
 * Outcome measure scores exceeding clinical thresholds
 */
async function detectElevatedScores(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const triggers: TriggerContext[] = [];

  // Get recent outcome measures
  const { data: measures, error } = await supabase
    .from("outcome_measures")
    .select(
      `
      id,
      patient_id,
      measure_type,
      score,
      max_score,
      measurement_date,
      patients!inner(
        id,
        first_name,
        last_name
      )
    `
    )
    .eq("practice_id", practiceId)
    .gte("measurement_date", getDemoDaysAgo(30))
    .order("measurement_date", { ascending: false });

  if (error) {
    log.error("Failed to query outcome measures", error);
    return triggers;
  }

  // Group by patient to get most recent per patient/measure type
  const latestMeasures = new Map<string, (typeof measures)[0]>();
  for (const measure of measures || []) {
    const key = `${measure.patient_id}-${measure.measure_type}`;
    if (!latestMeasures.has(key)) {
      latestMeasures.set(key, measure);
    }
  }

  for (const measure of latestMeasures.values()) {
    const measureType = measure.measure_type as "PHQ-9" | "GAD-7" | "PCL-5" | "Other";
    let isElevated = false;

    // Check against clinical thresholds
    if (measureType === "PHQ-9") {
      isElevated = measure.score >= CLINICAL_THRESHOLDS["PHQ-9"].clinicalConcern;
    } else if (measureType === "GAD-7") {
      isElevated = measure.score >= CLINICAL_THRESHOLDS["GAD-7"].clinicalConcern;
    } else if (measureType === "PCL-5") {
      isElevated = measure.score >= CLINICAL_THRESHOLDS["PCL-5"].threshold;
    }

    if (isElevated) {
      const patient = measure.patients as unknown as {
        id: string;
        first_name: string;
        last_name: string;
      };
      const urgency = getUrgencyFromOutcomeScore(measureType, measure.score);
      const severity = getOutcomeSeverity(measureType, measure.score);

      // Get previous score for trend
      const { data: prevMeasures } = await supabase
        .from("outcome_measures")
        .select("score")
        .eq("patient_id", measure.patient_id)
        .eq("measure_type", measure.measure_type)
        .lt("measurement_date", measure.measurement_date)
        .order("measurement_date", { ascending: false })
        .limit(1);

      const previousScore = prevMeasures?.[0]?.score;
      let trend: "improving" | "stable" | "worsening" | undefined;
      if (previousScore !== undefined) {
        const diff = measure.score - previousScore;
        if (diff <= -3) trend = "improving";
        else if (diff >= 3) trend = "worsening";
        else trend = "stable";
      }

      const data: OutcomeScoreData = {
        patient_name: `${patient.first_name} ${patient.last_name}`,
        patient_id: patient.id,
        measure_type: measureType,
        score: measure.score,
        max_score: measure.max_score,
        severity,
        previous_score: previousScore,
        trend,
        measurement_date: measure.measurement_date,
      };

      triggers.push({
        event: TriggerEvent.OUTCOME_SCORE_ELEVATED,
        patient_id: patient.id,
        practice_id: practiceId,
        data,
        triggered_at: new Date().toISOString(),
        urgency,
      });
    }
  }

  return triggers;
}

/**
 * Detect NEW_PATIENT_INTAKE_DUE triggers
 * New patients without completed intake
 */
async function detectNewPatientIntakes(practiceId: string): Promise<TriggerContext[]> {
  const supabase = createClient();
  const triggers: TriggerContext[] = [];
  const now = getDemoTodayDate();

  // Get recently added patients
  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, first_name, last_name, created_at")
    .eq("practice_id", practiceId)
    .eq("status", "Active")
    .gte("created_at", getDemoDaysAgo(30));

  if (error) {
    log.error("Failed to query new patients", error);
    return triggers;
  }

  for (const patient of patients || []) {
    // Check if patient has any completed appointments
    const { data: appointments } = await supabase
      .from("appointments")
      .select("id, date, status")
      .eq("patient_id", patient.id)
      .order("date", { ascending: true })
      .limit(1);

    const hasCompletedSession = appointments?.some((apt) => apt.status === "Completed");

    if (!hasCompletedSession) {
      const createdAt = new Date(patient.created_at);
      const daysSinceAdded = Math.floor(
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only trigger for patients added 3+ days ago without sessions
      if (daysSinceAdded >= 3) {
        const scheduledApt = appointments?.find((apt) => apt.status === "Scheduled");

        const data: NewPatientIntakeData = {
          patient_name: `${patient.first_name} ${patient.last_name}`,
          patient_id: patient.id,
          created_at: patient.created_at,
          days_since_added: daysSinceAdded,
          has_scheduled_appointment: !!scheduledApt,
          first_appointment_date: scheduledApt?.date,
        };

        triggers.push({
          event: TriggerEvent.NEW_PATIENT_INTAKE_DUE,
          patient_id: patient.id,
          practice_id: practiceId,
          data,
          triggered_at: new Date().toISOString(),
          urgency: UrgencyLevel.MEDIUM,
        });
      }
    }
  }

  return triggers;
}

/**
 * Get a summary of trigger counts by type
 */
export function getTriggerCounts(triggers: TriggerContext[]): Record<TriggerEvent, number> {
  const counts = {} as Record<TriggerEvent, number>;

  // Initialize all trigger types to 0
  Object.values(TriggerEvent).forEach((event) => {
    counts[event] = 0;
  });

  // Count each trigger
  triggers.forEach((trigger) => {
    counts[trigger.event]++;
  });

  return counts;
}

/**
 * Get triggers filtered by urgency level
 */
export function filterTriggersByUrgency(
  triggers: TriggerContext[],
  urgency: UrgencyLevel
): TriggerContext[] {
  return triggers.filter((t) => t.urgency === urgency);
}

/**
 * Sort triggers by urgency (most urgent first)
 */
export function sortTriggersByUrgency(triggers: TriggerContext[]): TriggerContext[] {
  const urgencyOrder: Record<UrgencyLevel, number> = {
    [UrgencyLevel.URGENT]: 0,
    [UrgencyLevel.HIGH]: 1,
    [UrgencyLevel.MEDIUM]: 2,
    [UrgencyLevel.LOW]: 3,
  };

  return [...triggers].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
}
