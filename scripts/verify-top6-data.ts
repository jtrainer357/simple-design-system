import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ihexlieooihjpfqzourv.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloZXhsaWVvb2loanBmcXpvdXJ2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTk4ODg4OCwiZXhwIjoyMDg1NTY0ODg4fQ.EJ5vWNWNedEdnL7KCt9A_9nGozX0gpm4oyMxOgt1Sbo";

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const practiceId = "550e8400-e29b-41d4-a716-446655440000";

// Top 6 patient IDs (alphabetically sorted)
const top6PatientIds = [
  "550e8400-e29b-41d4-a716-446655440020", // Brian Anton
  "550e8400-e29b-41d4-a716-446655440024", // Anthony Benedetti
  "550e8400-e29b-41d4-a716-446655440025", // Heather Donovan
  "550e8400-e29b-41d4-a716-446655440018", // Kevin Goldstein
  "550e8400-e29b-41d4-a716-446655440002", // Marcus Johnson
  "550e8400-e29b-41d4-a716-446655440013", // Nicole Kowalski
];

async function verify() {
  console.log("=== VERIFYING TOP 6 PATIENTS DATA ===\n");

  for (const patientId of top6PatientIds) {
    // Get patient name
    const { data: patient } = await supabase
      .from("patients")
      .select("first_name, last_name")
      .eq("id", patientId)
      .single();

    const name = patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";

    // Get priority actions
    const { data: actions } = await supabase
      .from("prioritized_actions")
      .select("title, urgency, ai_confidence")
      .eq("patient_id", patientId);

    // Get visit summaries
    const { data: summaries } = await supabase
      .from("visit_summaries")
      .select("appointment_type, visit_date")
      .eq("patient_id", patientId)
      .order("visit_date", { ascending: false });

    console.log(`📋 ${name}`);
    console.log(`   Priority Actions: ${actions?.length || 0}`);
    if (actions && actions.length > 0) {
      actions.forEach((a) => console.log(`     - ${a.title} [${a.urgency}] (${a.ai_confidence}%)`));
    } else {
      console.log(`     ⚠️  NO PRIORITY ACTIONS`);
    }

    console.log(`   Visit Summaries: ${summaries?.length || 0}`);
    if (summaries && summaries.length > 0) {
      summaries
        .slice(0, 3)
        .forEach((s) => console.log(`     - ${s.appointment_type} (${s.visit_date})`));
      if (summaries.length > 3) console.log(`     ... and ${summaries.length - 3} more`);
    } else {
      console.log(`     ⚠️  NO VISIT SUMMARIES`);
    }
    console.log("");
  }

  // Summary
  const { count: totalActions } = await supabase
    .from("prioritized_actions")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", practiceId);

  const { count: totalSummaries } = await supabase
    .from("visit_summaries")
    .select("*", { count: "exact", head: true })
    .eq("practice_id", practiceId);

  console.log("=== TOTALS ===");
  console.log(`Total Priority Actions: ${totalActions}`);
  console.log(`Total Visit Summaries: ${totalSummaries}`);
}

verify().catch(console.error);
