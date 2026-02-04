/**
 * Claude Substrate Intelligence
 * REAL AI-powered clinical analysis using Anthropic Claude
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface PatientAnalysisInput {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    primary_diagnosis_code: string;
    primary_diagnosis_name: string;
    medications?: string[];
    insurance_provider: string;
  };
  outcomeMeasures: Array<{
    measure_type: string;
    score: number;
    max_score: number;
    measurement_date: string;
  }>;
  recentAppointments: Array<{
    date: string;
    status: string;
    service_type: string;
  }>;
  upcomingAppointments: Array<{
    date: string;
    start_time: string;
  }>;
  recentMessages: Array<{
    direction: string;
    content: string;
    timestamp: string;
    read: boolean;
  }>;
  billing: {
    outstanding_balance: number;
    last_payment_date?: string;
  };
}

export interface PrioritizedAction {
  id: string;
  title: string;
  description: string;
  urgency: "urgent" | "high" | "medium" | "low";
  timeframe: "Immediate" | "Today" | "Within 3 days" | "This week" | "Next visit";
  confidence: number;
  suggestedActions: string[];
  clinicalReasoning: string;
  icon:
    | "alert-triangle"
    | "trending-up"
    | "trending-down"
    | "calendar"
    | "message-circle"
    | "dollar-sign"
    | "pill"
    | "clipboard";
}

export async function analyzePatientWithClaude(
  input: PatientAnalysisInput
): Promise<PrioritizedAction[]> {
  const {
    patient,
    outcomeMeasures,
    recentAppointments,
    upcomingAppointments,
    recentMessages,
    billing,
  } = input;

  // Format outcome measure history
  const phq9History = outcomeMeasures
    .filter((m) => m.measure_type === "PHQ-9")
    .sort((a, b) => a.measurement_date.localeCompare(b.measurement_date))
    .map((m) => `${m.measurement_date}: ${m.score}/${m.max_score}`)
    .join(" → ");

  const gad7History = outcomeMeasures
    .filter((m) => m.measure_type === "GAD-7")
    .sort((a, b) => a.measurement_date.localeCompare(b.measurement_date))
    .map((m) => `${m.measurement_date}: ${m.score}/${m.max_score}`)
    .join(" → ");

  // Check for concerning patterns
  const noShows = recentAppointments.filter((a) => a.status === "No-Show").length;
  const unreadMessages = recentMessages.filter((m) => !m.read && m.direction === "inbound").length;
  const hasUpcomingToday = upcomingAppointments.some(
    (a) => a.date === new Date().toISOString().split("T")[0]
  );

  const prompt = `You are a clinical decision support AI for a mental health practice. Analyze this patient's complete data and generate 2-4 prioritized clinical actions.

PATIENT: ${patient.first_name} ${patient.last_name}
DOB: ${patient.date_of_birth}
PRIMARY DIAGNOSIS: ${patient.primary_diagnosis_code} - ${patient.primary_diagnosis_name}
MEDICATIONS: ${patient.medications?.join(", ") || "None recorded"}
INSURANCE: ${patient.insurance_provider}

OUTCOME MEASURE HISTORY:
PHQ-9 (Depression, 0-27): ${phq9History || "No data"}
GAD-7 (Anxiety, 0-21): ${gad7History || "No data"}

RECENT APPOINTMENTS (last 30 days):
${
  recentAppointments
    .slice(0, 5)
    .map((a) => `- ${a.date}: ${a.service_type} (${a.status})`)
    .join("\n") || "None"
}

UPCOMING APPOINTMENTS:
${
  upcomingAppointments
    .slice(0, 3)
    .map((a) => `- ${a.date} at ${a.start_time}`)
    .join("\n") || "None scheduled"
}
${hasUpcomingToday ? "** HAS APPOINTMENT TODAY **" : ""}

RECENT MESSAGES:
${
  recentMessages
    .slice(0, 3)
    .map((m) => `- [${m.direction}] ${m.content.substring(0, 100)}...`)
    .join("\n") || "None"
}
Unread messages: ${unreadMessages}

BILLING:
Outstanding balance: $${billing.outstanding_balance.toFixed(2)}
${billing.last_payment_date ? `Last payment: ${billing.last_payment_date}` : "No recent payments"}

PATTERNS DETECTED:
- No-shows in last 30 days: ${noShows}
- Unread inbound messages: ${unreadMessages}

Based on this comprehensive patient picture, generate 2-4 prioritized clinical actions. Consider:
1. Safety concerns and risk factors
2. Treatment progress (improving, stable, worsening)
3. Engagement patterns (attendance, communication)
4. Practical needs (billing, scheduling)
5. Upcoming appointments and preparation

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "id": "unique-id",
    "title": "Brief, specific action title (max 50 chars)",
    "description": "Clinical context and reasoning (2-3 sentences)",
    "urgency": "urgent" | "high" | "medium" | "low",
    "timeframe": "Immediate" | "Today" | "Within 3 days" | "This week" | "Next visit",
    "confidence": 0.85,
    "suggestedActions": ["Specific action 1", "Specific action 2"],
    "clinicalReasoning": "Why this matters clinically",
    "icon": "alert-triangle" | "trending-up" | "trending-down" | "calendar" | "message-circle" | "dollar-sign" | "pill" | "clipboard"
  }
]

Prioritize actions by clinical urgency. Be specific and actionable.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse JSON response
    const actions = JSON.parse(content.text) as PrioritizedAction[];

    // Add unique IDs if not present
    return actions.map((action, i) => ({
      ...action,
      id: action.id || `action-${patient.id}-${i}`,
    }));
  } catch (error) {
    console.error("Claude analysis error:", error);

    // Fallback to rule-based actions if Claude fails
    return generateFallbackActions(input);
  }
}

function generateFallbackActions(input: PatientAnalysisInput): PrioritizedAction[] {
  const actions: PrioritizedAction[] = [];
  const { patient, outcomeMeasures, recentAppointments, billing } = input;

  // Check PHQ-9 trends
  const phq9 = outcomeMeasures
    .filter((m) => m.measure_type === "PHQ-9")
    .sort((a, b) => b.measurement_date.localeCompare(a.measurement_date));
  if (phq9.length >= 2 && phq9[0] && phq9[1]) {
    const latest = phq9[0].score;
    const previous = phq9[1].score;

    if (latest > previous + 3) {
      actions.push({
        id: `action-${patient.id}-phq9`,
        title: "PHQ-9 Score Increasing",
        description: `Depression screening score increased from ${previous} to ${latest}. Consider safety assessment and treatment adjustment.`,
        urgency: latest >= 15 ? "urgent" : "high",
        timeframe: latest >= 15 ? "Immediate" : "Within 3 days",
        confidence: 0.9,
        suggestedActions: [
          "Review recent stressors",
          "Assess for safety",
          "Consider medication adjustment",
        ],
        clinicalReasoning: "Worsening depression scores warrant clinical attention",
        icon: "trending-up",
      });
    }
  }

  // Check for no-shows
  const noShows = recentAppointments.filter((a) => a.status === "No-Show").length;
  if (noShows >= 2) {
    actions.push({
      id: `action-${patient.id}-noshow`,
      title: "Attendance Concern",
      description: `${noShows} missed appointments in recent weeks. Engagement may be declining.`,
      urgency: "high",
      timeframe: "Within 3 days",
      confidence: 0.85,
      suggestedActions: [
        "Outreach call",
        "Explore barriers to attendance",
        "Consider telehealth option",
      ],
      clinicalReasoning:
        "Missed appointments often indicate treatment disengagement or worsening symptoms",
      icon: "calendar",
    });
  }

  // Check billing
  if (billing.outstanding_balance > 200) {
    actions.push({
      id: `action-${patient.id}-billing`,
      title: "Outstanding Balance Review",
      description: `$${billing.outstanding_balance.toFixed(2)} outstanding. Discuss payment plan options.`,
      urgency: "low",
      timeframe: "Next visit",
      confidence: 0.75,
      suggestedActions: [
        "Review balance at session end",
        "Offer payment plan",
        "Verify insurance coverage",
      ],
      clinicalReasoning: "Financial barriers can impact treatment adherence",
      icon: "dollar-sign",
    });
  }

  return actions;
}

/**
 * Batch analyze multiple patients (for import)
 */
export async function analyzeMultiplePatients(
  patients: PatientAnalysisInput[]
): Promise<Map<string, PrioritizedAction[]>> {
  const results = new Map<string, PrioritizedAction[]>();

  // Process in parallel batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < patients.length; i += batchSize) {
    const batch = patients.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (patient) => {
        const actions = await analyzePatientWithClaude(patient);
        return { patientId: patient.patient.id, actions };
      })
    );

    batchResults.forEach(({ patientId, actions }) => {
      results.set(patientId, actions);
    });

    // Small delay between batches
    if (i + batchSize < patients.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
