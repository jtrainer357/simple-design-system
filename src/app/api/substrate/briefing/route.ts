/**
 * Pre-Session Briefing API Route
 * Generates AI-powered briefings for upcoming patient sessions.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClinicalFallbackChain } from "@/lib/ai/providers";
import { CLINICAL_THRESHOLDS } from "@/lib/triggers/trigger-types";
import type {
  PreSessionBriefingData,
  OutcomeScore,
  Medication,
} from "@/components/substrate/PreSessionBriefing";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get("patientId");
  const practiceId = searchParams.get("practiceId");
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!patientId || !practiceId) {
    return NextResponse.json(
      { error: "Missing patientId or practiceId" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Check if patient has appointment today
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data: appointment } = await supabase
      .from("appointments")
      .select("id, start_time, end_time, appointment_type, status")
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay)
      .neq("status", "cancelled")
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    if (!appointment) {
      return NextResponse.json({ data: null, hasAppointmentToday: false });
    }

    // Fetch patient data
    const { data: patient } = await supabase
      .from("patients")
      .select("id, first_name, last_name")
      .eq("id", patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch diagnoses
    const { data: diagnoses } = await supabase
      .from("patient_diagnoses")
      .select("diagnosis_name")
      .eq("patient_id", patientId)
      .eq("status", "active")
      .limit(5);

    // Fetch outcome measures
    const { data: outcomeMeasures } = await supabase
      .from("outcome_measures")
      .select("measure_type, score, administered_at")
      .eq("patient_id", patientId)
      .order("administered_at", { ascending: false })
      .limit(10);

    // Fetch medications
    const { data: medications } = await supabase
      .from("medications")
      .select("medication_name, dosage, frequency, prescribed_date, refill_due_date")
      .eq("patient_id", patientId)
      .eq("status", "active");

    // Fetch session count
    const { count: sessionCount } = await supabase
      .from("clinical_sessions")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("status", "completed");

    // Fetch last session
    const { data: lastSession } = await supabase
      .from("clinical_sessions")
      .select("session_date")
      .eq("patient_id", patientId)
      .eq("status", "completed")
      .order("session_date", { ascending: false })
      .limit(1)
      .single();

    // Process outcome scores
    const outcomeScores: OutcomeScore[] = [];
    const measureTypes = ["PHQ-9", "GAD-7", "PCL-5"] as const;

    for (const measureType of measureTypes) {
      const measures = (outcomeMeasures || []).filter(
        (m) => m.measure_type === measureType
      );

      if (measures.length > 0) {
        const current = measures[0];
        const previous = measures[1] || null;
        const threshold = CLINICAL_THRESHOLDS[measureType];

        outcomeScores.push({
          measureType,
          currentScore: current.score,
          previousScore: previous?.score || null,
          maxScore: measureType === "PCL-5" ? 80 : 27,
          severity: getSeverity(current.score, threshold),
          dateAdministered: current.administered_at,
        });
      }
    }

    // Process medications
    const activeMedications: Medication[] = (medications || []).map((med) => ({
      name: med.medication_name,
      dosage: med.dosage,
      frequency: med.frequency,
      prescribedDate: med.prescribed_date,
      refillDue: med.refill_due_date,
    }));

    // Calculate treatment duration
    const treatmentDuration = calculateTreatmentDuration(sessionCount || 0);

    // Generate insights
    let keyInsights: string[] = [];
    let suggestedTopics: string[] = [];
    let riskFactors: string[] = [];

    try {
      const aiResponse = await generateBriefingInsights({
        patientName: `${patient.first_name} ${patient.last_name}`,
        diagnoses: diagnoses || [],
        outcomeScores,
        medications: activeMedications,
        sessionCount: sessionCount || 0,
      });

      keyInsights = aiResponse.keyInsights;
      suggestedTopics = aiResponse.suggestedTopics;
      riskFactors = aiResponse.riskFactors;
    } catch {
      // Fallback to template insights
      const template = generateTemplateInsights({ outcomeScores, medications: activeMedications, sessionCount: sessionCount || 0 });
      keyInsights = template.keyInsights;
      suggestedTopics = template.suggestedTopics;
      riskFactors = template.riskFactors;
    }

    const briefingData: PreSessionBriefingData = {
      patientId,
      patientName: `${patient.first_name} ${patient.last_name}`,
      appointmentTime: new Date(appointment.start_time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      appointmentType: appointment.appointment_type || "Session",
      lastSessionDate: lastSession?.session_date || null,
      sessionCount: sessionCount || 0,
      treatmentDuration,
      primaryDiagnosis: (diagnoses || []).map((d) => d.diagnosis_name),
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

function getSeverity(score: number, threshold: { elevated: number; high: number; severe: number }): OutcomeScore["severity"] {
  if (score >= threshold.severe) return "severe";
  if (score >= threshold.high) return "moderately_severe";
  if (score >= threshold.elevated) return "moderate";
  if (score >= threshold.elevated / 2) return "mild";
  return "minimal";
}

function calculateTreatmentDuration(sessionCount: number): string {
  if (sessionCount === 0) return "New patient";
  const months = Math.ceil(sessionCount / 4);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""}`;
}

async function generateBriefingInsights(context: {
  patientName: string;
  diagnoses: Array<{ diagnosis_name: string }>;
  outcomeScores: OutcomeScore[];
  medications: Medication[];
  sessionCount: number;
}) {
  const aiProvider = createClinicalFallbackChain();

  const prompt = `Generate a brief pre-session clinical summary for ${context.patientName}.
Sessions: ${context.sessionCount}
Diagnoses: ${context.diagnoses.map((d) => d.diagnosis_name).join(", ") || "None"}
Medications: ${context.medications.map((m) => m.name).join(", ") || "None"}
Scores: ${context.outcomeScores.map((s) => `${s.measureType}: ${s.currentScore}`).join(", ") || "None"}

Return JSON: {"keyInsights": ["..."], "suggestedTopics": ["..."], "riskFactors": [...]}`;

  const response = await aiProvider.complete(prompt, { maxTokens: 300, temperature: 0.3 });
  return JSON.parse(response.content);
}

function generateTemplateInsights(context: { outcomeScores: OutcomeScore[]; medications: Medication[]; sessionCount: number }) {
  const keyInsights: string[] = [];
  const suggestedTopics: string[] = [];
  const riskFactors: string[] = [];

  for (const score of context.outcomeScores) {
    if (score.severity === "severe" || score.severity === "moderately_severe") {
      riskFactors.push(`Elevated ${score.measureType} (${score.currentScore})`);
    }
    if (score.previousScore !== null) {
      const diff = score.currentScore - score.previousScore;
      if (Math.abs(diff) >= 5) {
        keyInsights.push(`${score.measureType} ${diff > 0 ? "increased" : "decreased"} by ${Math.abs(diff)} points`);
      }
    }
  }

  if (context.sessionCount <= 3) {
    suggestedTopics.push("Treatment goals", "Therapeutic alliance");
  } else {
    suggestedTopics.push("Progress review");
  }

  if (keyInsights.length === 0) keyInsights.push("Review current symptoms");

  return { keyInsights, suggestedTopics, riskFactors };
}
