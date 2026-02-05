/**
 * Script to reload communications data into Supabase
 * Run with: npx tsx scripts/reload-communications.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ihexlieooihjpfqzourv.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface Communication {
  id: string;
  practice_id: string;
  patient_id: string;
  channel: string;
  direction: string;
  sender: string;
  recipient: string;
  sender_email: string;
  recipient_email: string;
  sender_phone: string;
  recipient_phone: string;
  message_body: string;
  is_read: boolean;
  sent_at: string;
  created_at: string;
}

function parseCSV(content: string): Communication[] {
  const lines = content.split("\n");
  const headers = lines[0]!.split(",");
  const records: Communication[] = [];

  let currentRecord: string[] = [];
  let inQuotes = false;
  let currentField = "";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]!;

    for (let j = 0; j < line.length; j++) {
      const char = line[j]!;

      if (char === '"' && (j === 0 || line[j - 1] !== "\\")) {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        currentRecord.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }

    if (!inQuotes) {
      currentRecord.push(currentField);
      currentField = "";

      if (currentRecord.length === headers.length) {
        const record: Record<string, string> = {};
        headers.forEach((h, idx) => {
          record[h.trim()] = currentRecord[idx]?.trim() || "";
        });

        if (record.id && record.practice_id) {
          records.push({
            id: record.id,
            practice_id: record.practice_id,
            patient_id: record.patient_id,
            channel: record.channel?.toLowerCase() || "sms",
            direction: record.direction,
            sender: record.sender || null,
            recipient: record.recipient || null,
            sender_email: record.sender_email || null,
            recipient_email: record.recipient_email || null,
            sender_phone: record.sender_phone || null,
            recipient_phone: record.recipient_phone || null,
            message_body: record.message_body,
            is_read: record.is_read?.toLowerCase() === "true",
            sent_at: record.sent_at,
            created_at: record.created_at,
          } as Communication);
        }
      }
      currentRecord = [];
    } else {
      currentField += "\n";
    }
  }

  return records;
}

async function main() {
  console.log("Loading communications CSV...");

  const csvPath = path.join(__dirname, "../AlldataUpdatesSmall/demo_communications.csv");
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const records = parseCSV(csvContent);

  console.log(`Parsed ${records.length} communication records`);

  // Delete existing communications
  console.log("Deleting existing communications...");
  const { error: deleteError } = await supabase
    .from("communications")
    .delete()
    .eq("practice_id", "550e8400-e29b-41d4-a716-446655440000");

  if (deleteError) {
    console.error("Error deleting:", deleteError);
    process.exit(1);
  }

  // Insert new records in batches
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    console.log(
      `Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}...`
    );

    const { error: insertError } = await supabase.from("communications").insert(batch);

    if (insertError) {
      console.error("Error inserting batch:", insertError);
      console.error("First record in batch:", batch[0]);
      process.exit(1);
    }
  }

  console.log(`Successfully loaded ${records.length} communications!`);
}

main().catch(console.error);
