-- ============================================================================
-- MHMVP DEMO DATA - Table Creation Script
-- Creates missing tables for demo data
-- ============================================================================

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

-- Create communications table if it doesn't exist
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  channel TEXT, -- email, SMS, phone
  direction TEXT, -- inbound, outbound
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
  urgency TEXT, -- URGENT, HIGH, MEDIUM, LOW
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

-- Create reviews table if it doesn't exist
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

-- Add missing columns to patients table if they don't exist
DO $$
BEGIN
  -- Add address column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='address') THEN
    ALTER TABLE patients ADD COLUMN address TEXT;
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='city') THEN
    ALTER TABLE patients ADD COLUMN city TEXT;
  END IF;

  -- Add state column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='state') THEN
    ALTER TABLE patients ADD COLUMN state TEXT;
  END IF;

  -- Add zip_code column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='zip_code') THEN
    ALTER TABLE patients ADD COLUMN zip_code TEXT;
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='phone') THEN
    ALTER TABLE patients ADD COLUMN phone TEXT;
  END IF;

  -- Add insurance_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='insurance_id') THEN
    ALTER TABLE patients ADD COLUMN insurance_id TEXT;
  END IF;

  -- Add preferred_contact column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='patients' AND column_name='preferred_contact') THEN
    ALTER TABLE patients ADD COLUMN preferred_contact TEXT;
  END IF;
END $$;

-- Add missing columns to practices table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='address') THEN
    ALTER TABLE practices ADD COLUMN address TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='city') THEN
    ALTER TABLE practices ADD COLUMN city TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='state') THEN
    ALTER TABLE practices ADD COLUMN state TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='zip_code') THEN
    ALTER TABLE practices ADD COLUMN zip_code TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='phone') THEN
    ALTER TABLE practices ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='email') THEN
    ALTER TABLE practices ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='practices' AND column_name='owner_name') THEN
    ALTER TABLE practices ADD COLUMN owner_name TEXT;
  END IF;
END $$;

-- Add missing columns to appointments table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='appointment_date') THEN
    ALTER TABLE appointments ADD COLUMN appointment_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='appointment_time') THEN
    ALTER TABLE appointments ADD COLUMN appointment_time TIME;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='appointment_type') THEN
    ALTER TABLE appointments ADD COLUMN appointment_type TEXT;
  END IF;
END $$;

-- Add missing columns to outcome_measures table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='outcome_measures' AND column_name='date_administered') THEN
    ALTER TABLE outcome_measures ADD COLUMN date_administered DATE;
  END IF;
END $$;

-- Add missing columns to invoices table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='patient_name') THEN
    ALTER TABLE invoices ADD COLUMN patient_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invoice_number') THEN
    ALTER TABLE invoices ADD COLUMN invoice_number TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='invoice_date') THEN
    ALTER TABLE invoices ADD COLUMN invoice_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='service_date_start') THEN
    ALTER TABLE invoices ADD COLUMN service_date_start DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='service_date_end') THEN
    ALTER TABLE invoices ADD COLUMN service_date_end DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='description') THEN
    ALTER TABLE invoices ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='units') THEN
    ALTER TABLE invoices ADD COLUMN units INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='unit_price') THEN
    ALTER TABLE invoices ADD COLUMN unit_price DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='subtotal') THEN
    ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='insurance_provider') THEN
    ALTER TABLE invoices ADD COLUMN insurance_provider TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='insurance_id') THEN
    ALTER TABLE invoices ADD COLUMN insurance_id TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='total_due') THEN
    ALTER TABLE invoices ADD COLUMN total_due DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='amount_paid') THEN
    ALTER TABLE invoices ADD COLUMN amount_paid DECIMAL(10,2);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prioritized_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_communications_practice_id ON communications(practice_id);
CREATE INDEX IF NOT EXISTS idx_communications_patient_id ON communications(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_practice_id ON clinical_notes(practice_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient_id ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_visit_summaries_practice_id ON visit_summaries(practice_id);
CREATE INDEX IF NOT EXISTS idx_visit_summaries_patient_id ON visit_summaries(patient_id);
CREATE INDEX IF NOT EXISTS idx_prioritized_actions_practice_id ON prioritized_actions(practice_id);
CREATE INDEX IF NOT EXISTS idx_prioritized_actions_patient_id ON prioritized_actions(patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_practice_id ON reviews(practice_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON reviews(patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(review_type);

-- Create RLS policy for reviews (demo only - allows all)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'demo_reviews_all') THEN
    CREATE POLICY demo_reviews_all ON reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
