#!/usr/bin/env node
/**
 * Run Supabase Migration for MHMVP Demo Data
 * Usage: node scripts/run-migration.mjs
 *
 * Requires DATABASE_URL env var or SUPABASE_DB_PASSWORD
 */

import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Get connection string
const projectRef = 'ihexlieooihjpfqzourv';
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password) {
  console.error('Error: SUPABASE_DB_PASSWORD environment variable is required');
  console.error('');
  console.error('Find your password in Supabase Dashboard:');
  console.error('  Project Settings → Database → Connection string → Password');
  console.error('');
  console.error('Then run:');
  console.error('  SUPABASE_DB_PASSWORD="your-password" node scripts/run-migration.mjs');
  process.exit(1);
}

// Supabase direct connection string
const connectionString = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;

// Demo tables SQL - creates missing tables for MHMVP demo
const DEMO_TABLES_SQL = `
-- Create medications table if it doesn't exist
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  prescribing_provider TEXT,
  prescribing_provider_phone TEXT,
  start_date DATE,
  end_date DATE,
  refill_due_date DATE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create clinical_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT,
  appointment_date DATE,
  session_number INTEGER,
  note_type TEXT,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  cpt_code TEXT,
  mood_score TEXT,
  clinical_confidence TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  provider TEXT
);

-- Create visit_summaries table if it doesn't exist
CREATE TABLE IF NOT EXISTS visit_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinical_note_id UUID REFERENCES clinical_notes(id) ON DELETE SET NULL,
  visit_date DATE,
  patient_name TEXT,
  appointment_type TEXT,
  visit_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create prioritized_actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS prioritized_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  urgency TEXT,
  time_window TEXT,
  ai_confidence INTEGER,
  clinical_context TEXT,
  suggested_actions JSONB,
  patient_name TEXT,
  patient_age INTEGER,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create communications table if it doesn't exist
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  channel TEXT,
  direction TEXT,
  sender TEXT,
  recipient TEXT,
  sender_email TEXT,
  recipient_email TEXT,
  sender_phone TEXT,
  recipient_phone TEXT,
  message_body TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_id TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS preferred_contact TEXT;

-- Add missing columns to practices table
ALTER TABLE practices ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE practices ADD COLUMN IF NOT EXISTS owner_name TEXT;

-- Add missing columns to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type TEXT;

-- Add missing columns to outcome_measures table
ALTER TABLE outcome_measures ADD COLUMN IF NOT EXISTS date_administered DATE;

-- Add missing columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service_date_start DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS service_date_end DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS units INTEGER;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS insurance_id TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_due DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_practice_id ON clinical_notes(practice_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_id ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_visit_summaries_practice_id ON visit_summaries(practice_id);
CREATE INDEX IF NOT EXISTS idx_visit_summaries_patient_id ON visit_summaries(patient_id);
CREATE INDEX IF NOT EXISTS idx_prioritized_actions_practice_id ON prioritized_actions(practice_id);
CREATE INDEX IF NOT EXISTS idx_prioritized_actions_patient_id ON prioritized_actions(patient_id);
CREATE INDEX IF NOT EXISTS idx_communications_practice_id ON communications(practice_id);
CREATE INDEX IF NOT EXISTS idx_communications_patient_id ON communications(patient_id);
`;

async function runMigration() {
  console.log('Connecting to Supabase database...');

  const sql = postgres(connectionString, {
    ssl: 'require',
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
  });

  try {
    // Test connection
    const [{ now }] = await sql`SELECT now()`;
    console.log(`Connected! Server time: ${now}`);

    // Check command line argument
    const arg = process.argv[2];

    if (arg === '--demo-tables') {
      console.log('Creating demo tables and columns...');
      await sql.unsafe(DEMO_TABLES_SQL);
      console.log('');
      console.log('✓ Demo tables created successfully!');
      console.log('');
      console.log('Tables created/updated:');
      console.log('  - medications (new)');
      console.log('  - clinical_notes (new)');
      console.log('  - visit_summaries (new)');
      console.log('  - prioritized_actions (new)');
      console.log('  - communications (new)');
      console.log('  - patients (added columns)');
      console.log('  - practices (added columns)');
      console.log('  - appointments (added columns)');
      console.log('  - outcome_measures (added columns)');
      console.log('  - invoices (added columns)');
    } else {
      // Read migration file
      const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20260204000000_initial_schema.sql');

      if (!existsSync(migrationPath)) {
        console.log('Migration file not found, running demo tables setup...');
        await sql.unsafe(DEMO_TABLES_SQL);
        console.log('✓ Demo tables created successfully!');
      } else {
        const migrationSql = readFileSync(migrationPath, 'utf-8');
        console.log('Running migration...');
        await sql.unsafe(migrationSql);
        console.log('');
        console.log('✓ Migration completed successfully!');
      }
    }

    console.log('');
    console.log('You can now run the demo data loader!');

  } catch (error) {
    console.error('Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('');
      console.log('Note: Some tables/columns may already exist. This is usually fine.');
    }

    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
