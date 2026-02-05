import { createClient } from "@supabase/supabase-js";

// Load env vars manually
const supabaseUrl = "https://ihexlieooihjpfqzourv.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXhsaWVvb2loanBmcXpvdXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk4ODg4OCwiZXhwIjoyMDg1NTY0ODg4fQ.EJ5vWNWNedEdnL7KCt9A_9nGozX0gpm4oyMxOgt1Sbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PRACTICE_ID = "550e8400-e29b-41d4-a716-446655440000";

// New priority actions for top 6 alphabetical patients
const newPriorityActions = [
  {
    id: "850e8400-e29b-41d4-a716-446655440006",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440020", // Brian Antonelli
    title: "Recovery Milestone - 9 Year Sobriety Check-in",
    urgency: "MEDIUM",
    time_window: "This week",
    ai_confidence: 91,
    clinical_context:
      "Brian Antonelli, 61M. Substance Use Disorder in sustained remission (9 years sober). Annual sobriety milestone approaching. Strong recovery foundation but recent work stress noted. Maintenance support indicated.",
    suggested_actions: [
      "Acknowledge 9-year sobriety milestone in session",
      "Review relapse prevention plan",
      "Assess current stress coping strategies",
      "Connect with sponsor/support network",
    ],
    patient_name: "Brian Antonelli",
    patient_age: 61,
    status: "pending",
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440007",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440024", // Anthony Benedetti
    title: "DBT Skills Consolidation Due",
    urgency: "HIGH",
    time_window: "Within 3 days",
    ai_confidence: 89,
    clinical_context:
      "Anthony Benedetti, 54M. Borderline traits with anger dysregulation. Recent DBT module completed. Skills practice showing improvement but needs consolidation. Interpersonal effectiveness focus recommended.",
    suggested_actions: [
      "Review DBT TIPP skills application",
      "Assess interpersonal conflict patterns",
      "Schedule skills group continuation",
      "Reinforce distress tolerance techniques",
    ],
    patient_name: "Anthony Benedetti",
    patient_age: 54,
    status: "pending",
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440008",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440025", // Heather Donovan
    title: "Telehealth Follow-up - GAD Assessment",
    urgency: "HIGH",
    time_window: "Today",
    ai_confidence: 92,
    clinical_context:
      "Heather Donovan, 36F. Generalized Anxiety Disorder with parenting stress. Recent telehealth sessions showing good engagement. GAD-7 score trending down (14→11). Continue momentum with coping skills.",
    suggested_actions: [
      "Complete GAD-7 reassessment",
      "Review work-life balance strategies",
      "Assess sleep hygiene progress",
      "Plan anxiety management for upcoming school events",
    ],
    patient_name: "Heather Donovan",
    patient_age: 36,
    status: "pending",
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440009",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440018", // Kevin Goldstein
    title: "ADHD Medication Review Needed",
    urgency: "HIGH",
    time_window: "Within 3 days",
    ai_confidence: 95,
    clinical_context:
      "Kevin Goldstein, 50M. Adult ADHD on stimulant therapy. Quarterly medication review due. Patient reports improved focus at work. Side effect monitoring indicated.",
    suggested_actions: [
      "Complete stimulant medication review",
      "Assess cardiovascular monitoring (BP, HR)",
      "Review work performance improvements",
      "Discuss medication timing optimization",
    ],
    patient_name: "Kevin Goldstein",
    patient_age: 50,
    status: "pending",
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440010",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440013", // Nicole Kowalski
    title: "Grief Processing - Anniversary Approaching",
    urgency: "HIGH",
    time_window: "This week",
    ai_confidence: 87,
    clinical_context:
      "Nicole Kowalski, 30F. Complicated grief following father's death (18 months). Anniversary of loss approaching Feb 15. Increased support and proactive outreach indicated.",
    suggested_actions: [
      "Schedule pre-anniversary support session",
      "Review coping strategies for anniversary",
      "Assess current grief stage and functioning",
      "Connect with grief support resources",
    ],
    patient_name: "Nicole Kowalski",
    patient_age: 30,
    status: "pending",
  },
];

// New visit summaries for top 6 alphabetical patients
const newVisitSummaries = [
  // Brian Antonelli
  {
    id: "b1a1f30e-08e8-446f-8e3b-b945db4f4520",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440020",
    visit_date: "2025-12-16",
    patient_name: "Brian Antonelli",
    appointment_type: "Individual Therapy",
    visit_summary: `Individual Therapy - 2025-12-16

Session Focus:
Patient: 61-year-old in sustained recovery (9 years sober). Reports: "Holiday season is always tricky but I'm prepared this year." Discussed relapse prevention strategies for upcoming family gatherings. Patient has strong sponsor relationship and attends AA meetings 3x weekly. Work stress noted - new supervisor creating tension...

Assessment:
Substance Use Disorder (Alcohol), in sustained remission. Strong recovery foundation. Current stress is manageable with existing coping skills. No relapse warning signs present...

Next Steps:
Continue monthly maintenance therapy. Review HALT (Hungry, Angry, Lonely, Tired) awareness. Increase meeting attendance during holiday period if needed. Contact sponsor proactively. Schedule post-holiday check-in...`,
  },
  {
    id: "b2a1f30e-08e8-446f-8e3b-b945db4f4521",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440020",
    visit_date: "2026-01-17",
    patient_name: "Brian Antonelli",
    appointment_type: "Individual Therapy",
    visit_summary: `Individual Therapy - 2026-01-17

Session Focus:
Patient: "Made it through the holidays clean and sober - 9 years strong." Successfully navigated multiple family events without relapse. Used coping skills: called sponsor before difficult events, left early when needed, had exit plan ready. Work situation improving - had direct conversation with supervisor...

Assessment:
Substance Use Disorder (Alcohol), sustained remission. Excellent holiday navigation. Demonstrates mature recovery skills and self-awareness. Anniversary milestone (Feb 2) approaching - plan celebration...

Next Steps:
Plan 9-year sobriety celebration. Continue monthly therapy. Address work stress with assertiveness skills. Maintain current AA meeting schedule. Strong prognosis for continued recovery...`,
  },
  // Anthony Benedetti
  {
    id: "b3a1f30e-08e8-446f-8e3b-b945db4f4524",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440024",
    visit_date: "2025-12-20",
    patient_name: "Anthony Benedetti",
    appointment_type: "DBT Skills Group",
    visit_summary: `DBT Skills Group - 2025-12-20

Session Focus:
Patient: 54-year-old completing DBT interpersonal effectiveness module. Reports: "I actually paused before reacting to my wife last week - that's new for me." Practicing DEAR MAN skills in daily interactions. Anger episodes decreased from 4x weekly to 1x weekly. Sleep improved with distress tolerance techniques...

Assessment:
Borderline traits with anger dysregulation, responding well to DBT. Significant improvement in emotional regulation. Interpersonal skills developing. Wife reports positive changes at home...

Next Steps:
Complete interpersonal effectiveness module. Begin emotion regulation focus. Continue TIPP skills practice. Schedule couples session to reinforce communication improvements. Track anger episodes in diary card...`,
  },
  {
    id: "b4a1f30e-08e8-446f-8e3b-b945db4f4525",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440024",
    visit_date: "2026-01-20",
    patient_name: "Anthony Benedetti",
    appointment_type: "Individual Therapy",
    visit_summary: `Individual Therapy - 2026-01-20

Session Focus:
Patient: "My wife said I'm like a different person." Reports only one anger outburst in past month (vs weekly previously). Using opposite action effectively. Relationship with adult children improving. Work conflicts handled with DEAR MAN approach - received positive feedback from manager...

Assessment:
Borderline traits with anger dysregulation, excellent DBT response. Skills generalization occurring across multiple life domains. Therapeutic gains consolidating...

Next Steps:
Continue DBT skills group (emotion regulation module). Individual therapy focus on maintaining gains. Discuss gradual therapy frequency reduction. Reinforce self-efficacy and progress recognition...`,
  },
  // Heather Donovan
  {
    id: "b5a1f30e-08e8-446f-8e3b-b945db4f4526",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440025",
    visit_date: "2025-12-15",
    patient_name: "Heather Donovan",
    appointment_type: "Telehealth Session",
    visit_summary: `Telehealth Session - 2025-12-15

Session Focus:
Patient: 36-year-old mother of two, managing GAD via telehealth. Reports: "The flexibility of video sessions has been a lifesaver with my schedule." Anxiety about children's school performance noted. Sleep improved to 7 hours nightly. Using progressive muscle relaxation before bed. GAD-7 score: 14 (moderate)...

Assessment:
Generalized Anxiety Disorder, moderate severity. Telehealth format working well for patient. Good engagement with CBT techniques. Parenting stress contributing to anxiety maintenance...

Next Steps:
Continue telehealth CBT. Focus on cognitive restructuring for parenting worries. Introduce worry time scheduling. Practice thought challenging with school-related concerns. Reassess GAD-7 in 4 weeks...`,
  },
  {
    id: "b6a1f30e-08e8-446f-8e3b-b945db4f4527",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440025",
    visit_date: "2026-01-22",
    patient_name: "Heather Donovan",
    appointment_type: "Telehealth Session",
    visit_summary: `Telehealth Session - 2026-01-22

Session Focus:
Patient: "I'm learning that most of what I worry about never happens." GAD-7 improved to 11 (mild-moderate). Reports using worry time effectively - limiting worry to scheduled 15-minute periods. Children doing well in school (one of main worry topics). Practicing letting go of uncontrollable outcomes...

Assessment:
Generalized Anxiety Disorder, improving. GAD-7 showing positive trend (14→11). Cognitive restructuring skills developing. Patient demonstrating insight into worry patterns...

Next Steps:
Continue telehealth CBT. Build on cognitive gains. Address anticipatory anxiety for upcoming school events. Maintain worry time practice. Consider meditation app for ongoing support. Schedule follow-up GAD-7...`,
  },
  // Kevin Goldstein
  {
    id: "b7a1f30e-08e8-446f-8e3b-b945db4f4528",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440018",
    visit_date: "2025-11-20",
    patient_name: "Kevin Goldstein",
    appointment_type: "Medication Management",
    visit_summary: `Medication Management - 2025-11-20

Session Focus:
Patient: 50-year-old with adult ADHD on stimulant therapy (Adderall XR 30mg). Reports: "My focus at work has never been better." Completed major project ahead of deadline for first time. Side effects: mild appetite suppression (manageable), occasional afternoon "crash." BP: 128/82, HR: 78 - within acceptable range...

Assessment:
Adult ADHD, well-controlled on current medication. Significant functional improvement at work. Side effect profile acceptable. Cardiovascular parameters stable...

Next Steps:
Continue Adderall XR 30mg daily. Add protein-rich breakfast to address appetite. Consider afternoon booster if crash persists. Quarterly cardiovascular monitoring. Discuss organizational strategies to complement medication...`,
  },
  {
    id: "b8a1f30e-08e8-446f-8e3b-b945db4f4529",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440018",
    visit_date: "2026-01-23",
    patient_name: "Kevin Goldstein",
    appointment_type: "Medication Management",
    visit_summary: `Medication Management - 2026-01-23

Session Focus:
Patient: "Got a promotion at work - they said my performance has been outstanding." Reports sustained focus improvement. Afternoon energy improved with protein snack strategy. Using digital calendar and reminders effectively. BP: 126/80, HR: 76 - stable. Sleep adequate (7 hours). No mood concerns...

Assessment:
Adult ADHD, excellent medication response. Functional gains translated to career advancement. Combined medication and behavioral strategies working synergistically...

Next Steps:
Continue Adderall XR 30mg daily. Quarterly medication review due - schedule comprehensive assessment. Reinforce organizational systems. Discuss long-term medication management plan. Continue cardiovascular monitoring...`,
  },
  // Nicole Kowalski
  {
    id: "b9a1f30e-08e8-446f-8e3b-b945db4f4530",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440013",
    visit_date: "2025-12-03",
    patient_name: "Nicole Kowalski",
    appointment_type: "Grief Therapy",
    visit_summary: `Grief Therapy - 2025-12-03

Session Focus:
Patient: 30-year-old processing complicated grief (father's death 15 months ago). Reports: "The holidays are so hard without him." Anniversary approaching (Feb 15). Tearful discussing family traditions. Has connected with sibling for mutual support. Returned to some activities (yoga, dinner with friends)...

Assessment:
Complicated grief, processing phase. Anniversary reaction anticipated. Good progress in re-engaging with life while honoring grief. Support system activated (sibling, friends)...

Next Steps:
Discuss anticipatory grief for upcoming anniversary. Plan meaningful rituals to honor father's memory. Continue exposure to grief triggers in gradual way. Assess need for increased session frequency around anniversary...`,
  },
  {
    id: "baa1f30e-08e8-446f-8e3b-b945db4f4531",
    practice_id: PRACTICE_ID,
    patient_id: "550e8400-e29b-41d4-a716-446655440013",
    visit_date: "2026-01-20",
    patient_name: "Nicole Kowalski",
    appointment_type: "Individual Therapy",
    visit_summary: `Individual Therapy - 2026-01-20

Session Focus:
Patient: "I'm dreading February but I have a plan this time." Anniversary approaching (Feb 15 - father's death). Has planned meaningful activities: visiting grave with siblings, cooking father's favorite meal, donating to his favorite charity. Reports: "I think he would be proud of how I'm handling this"...

Assessment:
Complicated grief, continued progress. Patient demonstrates adaptive coping and meaning-making. Anniversary plan shows healthy integration of loss. Proactive approach indicates therapeutic gains...

Next Steps:
Schedule additional session week of anniversary (Feb 15). Review coping plan and backup strategies. Normalize potential grief surge around anniversary. Celebrate progress while holding space for continued grief work...`,
  },
];

async function loadData() {
  console.log("Loading priority actions and visit summaries for top 6 patients...\n");

  // Insert priority actions
  console.log("Inserting priority actions...");
  for (const action of newPriorityActions) {
    const { error } = await supabase
      .from("prioritized_actions")
      .upsert(action, { onConflict: "id" });

    if (error) {
      console.error(`  Error inserting action for ${action.patient_name}:`, error.message);
    } else {
      console.log(`  ✓ ${action.patient_name}: ${action.title}`);
    }
  }

  // Insert visit summaries
  console.log("\nInserting visit summaries...");
  for (const summary of newVisitSummaries) {
    const { error } = await supabase.from("visit_summaries").upsert(summary, { onConflict: "id" });

    if (error) {
      console.error(`  Error inserting summary for ${summary.patient_name}:`, error.message);
    } else {
      console.log(
        `  ✓ ${summary.patient_name}: ${summary.appointment_type} (${summary.visit_date})`
      );
    }
  }

  // Verify counts
  console.log("\nVerifying data...");

  const { count: actionCount } = await supabase
    .from("prioritized_actions")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", PRACTICE_ID);

  const { count: summaryCount } = await supabase
    .from("visit_summaries")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", PRACTICE_ID);

  console.log(`  Priority actions: ${actionCount}`);
  console.log(`  Visit summaries: ${summaryCount}`);

  console.log("\nDone!");
}

loadData().catch(console.error);
