/**
 * Quick script to update Brian Antonelli -> Brian Anton in the database
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Read .env.local manually
const envFile = readFileSync(".env.local", "utf-8");
const envVars: Record<string, string> = {};
envFile.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseKey =
  envVars["SUPABASE_SERVICE_ROLE_KEY"] || envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateBrianName() {
  console.log("Updating Brian Antonelli -> Brian Anton...");

  const { data, error } = await supabase
    .from("patients")
    .update({ last_name: "Anton" })
    .eq("first_name", "Brian")
    .eq("last_name", "Antonelli")
    .select();

  if (error) {
    console.error("Error updating patient:", error);
    process.exit(1);
  }

  if (data && data.length > 0) {
    console.log("Successfully updated patient:", data[0]);
  } else {
    console.log("No patient found with name 'Brian Antonelli'");
  }
}

updateBrianName();
