import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ihexlieooihjpfqzourv.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXhsaWVvb2loanBmcXpvdXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk4ODg4OCwiZXhwIjoyMDg1NTY0ODg4fQ.EJ5vWNWNedEdnL7KCt9A_9nGozX0gpm4oyMxOgt1Sbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const PRACTICE_ID = "550e8400-e29b-41d4-a716-446655440000";

// Marcus Johnson's visit summaries (from original CSV data)
const marcusSummaries = [
  {
    id: "7a1a5082-d139-409c-b038-678ff4c45320",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440002",
    clinical_note_id: null,
    visit_date: "2025-09-22",
    patient_name: "Marcus Johnson",
    appointment_type: "Initial Intake",
    visit_summary: `Initial Intake - 2025-09-22

Session Focus:
Patient presents with complaint: "I worry about everything constantly." Reports excessive worry about work performance, health, finances for past 6 months. Worry is difficult to control (6+ hours daily). Physical symptoms: tension headaches, muscle tension (especially neck/shoulders), difficulty concentrating...

Assessment:
Generalized Anxiety Disorder, moderate severity. Onset 6 months ago (correlates with job promotion stress). No prior psychiatric history. Good insight. No active substance use...

Next Steps:
Start Escitalopram 5mg daily, titrate to 10mg in 1 week. Teach relaxation skills: progressive muscle relaxation, box breathing. Weekly individual therapy (CBT). Behavioral: reduce caffeine (patient currently drinks 4+ cups/day)...`,
  },
  {
    id: "a994a92b-a3f1-4091-a01b-63dd44ff5184",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440002",
    clinical_note_id: null,
    visit_date: "2025-11-10",
    patient_name: "Marcus Johnson",
    appointment_type: "Individual Therapy",
    visit_summary: `Individual Therapy - 2025-11-10

Session Focus:
Patient reports: "It's not as bad, but I still worry a lot." Worry duration now 2-3 hours daily (down from 6+). Physical tension decreased by 50%, headaches less frequent. Sleep improved: falls asleep in 20 minutes most nights. Work concentration better. "I feel like I can focus on my job promotion now"...

Assessment:
Generalized Anxiety Disorder, responding well to treatment. About 50% symptom improvement. Prognosis excellent given medication response and engagement in therapy...

Next Steps:
Continue Escitalopram 10mg daily. Continue weekly therapy, shift focus to cognitive restructuring and worry exposure. Patient doing great with behavioral techniques - continue homework. Job interview prep discussed...`,
  },
  {
    id: "f44a6b1d-499f-4606-8f24-2e52bcad7c29",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440002",
    clinical_note_id: null,
    visit_date: "2026-01-19",
    patient_name: "Marcus Johnson",
    appointment_type: "Individual Therapy",
    visit_summary: `Individual Therapy - 2026-01-19

Session Focus:
Patient: "Things are really better now. I got the promotion!" Worry now minimal, 30 minutes or less daily. No longer impacts functioning. Sleep normal. Physical tension resolved. "I'm using the coping skills automatically now." Job going great - even took on a challenging project. Dating: recently started seeing someone new...

Assessment:
Generalized Anxiety Disorder, in remission. Excellent treatment response to combined pharmacotherapy and CBT. Patient has incorporated coping skills into daily life. Maintenance phase appropriate...

Next Steps:
Continue Escitalopram 10mg daily (maintain for 12 months minimum). Transition to monthly therapy for relapse prevention and life maintenance. Discussed tapering plan (would begin in 6 months if remains stable)...`,
  },
];

async function loadMarcusSummaries() {
  console.log("Loading Marcus Johnson's visit summaries...\n");

  for (const summary of marcusSummaries) {
    const { error } = await supabase.from("visit_summaries").upsert(summary, { onConflict: "id" });

    if (error) {
      console.error(`  Error: ${error.message}`);
    } else {
      console.log(`  ✓ ${summary.appointment_type} (${summary.visit_date})`);
    }
  }

  // Verify
  const { data } = await supabase
    .from("visit_summaries")
    .select("appointment_type, visit_date")
    .eq("patient_id", "550e8400-e29b-41d4-a716-446655440002")
    .order("visit_date", { ascending: false });

  console.log(`\nMarcus Johnson now has ${data?.length} visit summaries`);
}

loadMarcusSummaries().catch(console.error);
