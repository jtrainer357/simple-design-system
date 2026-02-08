/**
 * Pre-Session Briefing API Route
 * Generates AI-powered briefings for upcoming patient sessions.
 *
 * Note: This is a stub implementation. Full implementation requires
 * clinical_sessions, medications, and patient_diagnoses tables.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import type {
  PreSessionBriefingData,
  OutcomeScore,
  Medication,
} from "@/src/components/substrate/PreSessionBriefing";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");
  const practiceId = searchParams.get("practiceId");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!patientId || !practiceId) {
    return NextResponse.json({ error: "Missing patientId or practiceId" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Check if patient has appointment today
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, start_time, end_time, service_type, status")
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .neq("status", "Cancelled")
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (!appointment) {
      return NextResponse.json({ data: null, hasAppointmentToday: false });
    }

    // Fetch patient data
    const { data: patient } = await supabase
      .from("patients")
      .select(
        "id, first_name, last_name, primary_diagnosis_name, medications, treatment_start_date"
      )
      .eq("id", patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch outcome measures if table exists
    const outcomeScores: OutcomeScore[] = [];
    try {
      const { data: outcomeMeasures } = await supabase
        .from("outcome_measures")
        .select("measure_type, score, measurement_date")
        .eq("patient_id", patientId)
        .order("measurement_date", { ascending: false })
        .limit(10);

      if (outcomeMeasures && outcomeMeasures.length > 0) {
        const measureTypes = ["PHQ-9", "GAD-7", "PCL-5"] as const;
        for (const measureType of measureTypes) {
          const measures = outcomeMeasures.filter((m) => m.measure_type === measureType);
          if (measures.length > 0) {
            const current = measures[0]!;
            const previous = measures[1] || null;
            outcomeScores.push({
              measureType,
              currentScore: current.score,
              previousScore: previous?.score ?? null,
              maxScore: measureType === "PCL-5" ? 80 : 27,
              severity: getSeverityFromScore(measureType, current.score),
              dateAdministered: current.measurement_date,
            });
          }
        }
      }
    } catch {
      // Table may not exist yet
    }

    // Use patient's medications array if available
    const activeMedications: Medication[] = (patient.medications || []).map((med: string) => ({
      name: med,
      dosage: "",
      frequency: "",
      prescribedDate: "",
    }));

    // Calculate treatment duration from treatment_start_date
    const treatmentDuration = patient.treatment_start_date
      ? calculateDuration(patient.treatment_start_date)
      : "New patient";

    // Generate template insights
    const { keyInsights, suggestedTopics, riskFactors } = generateTemplateInsights({
      outcomeScores,
      medications: activeMedications,
      primaryDiagnosis: patient.primary_diagnosis_name,
    });

    const briefingData: PreSessionBriefingData = {
      patientId,
      patientName: `${patient.first_name} ${patient.last_name}`,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      appointmentType: appointment.service_type || "Session",
      lastSessionDate: null,
      sessionCount: 0,
      treatmentDuration,
      primaryDiagnosis: patient.primary_diagnosis_name ? [patient.primary_diagnosis_name] : [],
      outcomeScores,
      activeMedications,
      recentNotes: [],
      keyInsights,
      suggestedTopics,
      riskFactors,
    };

    return NextResponse.json({ data: briefingData, hasAppointmentToday: true });
  } catch (error) {
    console.error("Error generating briefing:", error);
    return NextResponse.json({ error: "Failed to generate briefing" }, { status: 500 });
  }
}

function getSeverityFromScore(
  measureType: "PHQ-9" | "GAD-7" | "PCL-5",
  score: number
): OutcomeScore["severity"] {
  const thresholds: Record<
    string,
    { mild: number; moderate: number; moderately_severe: number; severe: number }
  > = {
    "PHQ-9": { mild: 5, moderate: 10, moderately_severe: 15, severe: 20 },
    "GAD-7": { mild: 5, moderate: 10, moderately_severe: 15, severe: 21 },
    "PCL-5": { mild: 20, moderate: 31, moderately_severe: 45, severe: 60 },
  };

  const t = thresholds[measureType]!;
  if (score >= t.severe) return "severe";
  if (score >= t.moderately_severe) return "moderately_severe";
  if (score >= t.moderate) return "moderate";
  if (score >= t.mild) return "mild";
  return "minimal";
}

function calculateDuration(startDate: string): string {
  const start = new Date(startDate);
  const now = new Date();
  const months = Math.floor((now.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000));
  if (months < 1) return "< 1 month";
  if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""}`;
}

function generateTemplateInsights(context: {
  outcomeScores: OutcomeScore[];
  medications: Medication[];
  primaryDiagnosis?: string | null;
}) {
  const keyInsights: string[] = [];
  const suggestedTopics: string[] = [];
  const riskFactors: string[] = [];

  // Check outcome scores for insights
  for (const score of context.outcomeScores) {
    if (score.severity === "severe" || score.severity === "moderately_severe") {
      riskFactors.push(`Elevated ${score.measureType} (${score.currentScore})`);
    }
    if (score.previousScore !== null) {
      const diff = score.currentScore - score.previousScore;
      if (Math.abs(diff) >= 5) {
        keyInsights.push(
          `${score.measureType} ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff)} points`
        );
      }
    }
  }

  // Default suggested topics
  suggestedTopics.push("Progress review", "Treatment goals");

  if (keyInsights.length === 0) {
    keyInsights.push("Review current symptoms and treatment progress");
  }

  return { keyInsights, suggestedTopics, riskFactors };
}
