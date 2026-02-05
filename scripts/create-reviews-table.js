#!/usr/bin/env node
/**
 * Create reviews table and insert data using direct Postgres connection
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

// Check for DATABASE_URL first, then try constructing from Supabase credentials
let connectionString = env['DATABASE_URL'];

if (!connectionString) {
  // Try to get it from SUPABASE_DB_URL or construct it
  const dbPassword = env['SUPABASE_DB_PASSWORD'] || env['POSTGRES_PASSWORD'];

  if (dbPassword) {
    // Standard Supabase pooler connection
    connectionString = `postgresql://postgres.ihexlieooihjpfqzourv:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
  }
}

if (!connectionString) {
  console.log('❌ No DATABASE_URL or SUPABASE_DB_PASSWORD found in .env.local');
  console.log('\nTo fix this, add one of these to your .env.local:');
  console.log('  DATABASE_URL=postgresql://postgres.ihexlieooihjpfqzourv:[YOUR_DB_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres');
  console.log('  SUPABASE_DB_PASSWORD=[YOUR_DB_PASSWORD]');
  console.log('\nYou can find your database password in Supabase Dashboard > Settings > Database');
  console.log('\n--- ALTERNATIVE: Run this SQL in Supabase Dashboard > SQL Editor ---\n');

  // Print the SQL to run manually
  console.log(`
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('treatment_outcome', 'care_quality', 'provider_feedback', 'general')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  review_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY demo_reviews_all ON reviews FOR ALL USING (true) WITH CHECK (true);
`);
  process.exit(1);
}

const createTableSQL = `
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('treatment_outcome', 'care_quality', 'provider_feedback', 'general')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  review_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

const enableRLS = `ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;`;

const createPolicy = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'demo_reviews_all') THEN
    CREATE POLICY demo_reviews_all ON reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_practice_id ON reviews(practice_id);
`;

async function main() {
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Create table
    console.log('Creating reviews table...');
    await client.query(createTableSQL);
    console.log('✅ Table created\n');

    // Enable RLS
    console.log('Enabling RLS...');
    await client.query(enableRLS);
    console.log('✅ RLS enabled\n');

    // Create policy
    console.log('Creating access policy...');
    await client.query(createPolicy);
    console.log('✅ Policy created\n');

    // Create indexes
    console.log('Creating indexes...');
    await client.query(createIndexes);
    console.log('✅ Indexes created\n');

    console.log('🎉 Reviews table setup complete!');
    console.log('\nNow run: node scripts/setup-reviews.js');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
