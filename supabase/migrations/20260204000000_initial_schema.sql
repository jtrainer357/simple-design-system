-- Mental Health MVP - Initial Database Schema
-- Created: 2026-02-04
-- This migration creates all tables needed for the full-stack implementation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRACTICES (Multi-tenant foundation)
-- ============================================
CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PATIENTS
-- ============================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  -- External reference (from legacy/import)
  external_id TEXT,
  client_id TEXT,
  -- Core demographics
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F', 'Non-binary', 'Other', 'Prefer not to say')),
  -- Contact
  email TEXT,
  phone_mobile TEXT,
  phone_home TEXT,
  -- Address
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  -- Insurance
  insurance_provider TEXT,
  insurance_member_id TEXT,
  -- Clinical
  primary_diagnosis_code TEXT,
  primary_diagnosis_name TEXT,
  secondary_diagnosis_code TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  medications TEXT[], -- Array of current medications
  -- Treatment info
  treatment_start_date DATE,
  provider TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discharged')),
  -- Display
  avatar_url TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- External reference
  external_id TEXT,
  -- Timing
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  -- Details
  status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Completed', 'No-Show', 'Cancelled')),
  service_type TEXT NOT NULL,
  cpt_code TEXT,
  location TEXT,
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OUTCOME MEASURES (PHQ-9, GAD-7, PCL-5)
-- ============================================
CREATE TABLE outcome_measures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- Measure data
  measure_type TEXT NOT NULL CHECK (measure_type IN ('PHQ-9', 'GAD-7', 'PCL-5', 'Other')),
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  measurement_date DATE NOT NULL,
  administered_by TEXT,
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES (SMS, Email, Portal)
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- Message data
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'portal', 'voice')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVOICES / BILLING
-- ============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  -- External reference
  external_id TEXT,
  -- Service details
  date_of_service DATE NOT NULL,
  cpt_code TEXT,
  -- Financial
  charge_amount DECIMAL(10,2) NOT NULL,
  insurance_paid DECIMAL(10,2) DEFAULT 0,
  patient_responsibility DECIMAL(10,2) NOT NULL,
  patient_paid DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) NOT NULL,
  -- Status
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Partial', 'Denied', 'Cancelled')),
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRIORITY ACTIONS (Claude AI Generated)
-- ============================================
CREATE TABLE priority_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- Action details
  urgency TEXT NOT NULL CHECK (urgency IN ('urgent', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  clinical_context TEXT,
  ai_reasoning TEXT,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  timeframe TEXT, -- "Immediate", "Today", "Within 3 days", "This week", "Next visit"
  -- Suggested actions as JSONB array
  suggested_actions JSONB,
  -- Visual
  icon TEXT,
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLINICAL TASKS (AI Workflow Generated)
-- ============================================
CREATE TABLE clinical_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  priority_action_id UUID REFERENCES priority_actions(id) ON DELETE SET NULL,
  -- Task details
  task_type TEXT NOT NULL, -- "order_lab", "send_message", "refill_rx", "schedule_followup", "general"
  title TEXT NOT NULL,
  description TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI ANALYSIS RUNS (Audit Trail)
-- ============================================
CREATE TABLE ai_analysis_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  -- Run details
  batch_id TEXT NOT NULL,
  patients_analyzed INTEGER NOT NULL,
  actions_generated INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  -- Metadata
  metadata JSONB,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Patients
CREATE INDEX idx_patients_practice ON patients(practice_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_risk_level ON patients(risk_level);
CREATE INDEX idx_patients_external_id ON patients(external_id);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);

-- Appointments
CREATE INDEX idx_appointments_practice ON appointments(practice_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient_date ON appointments(patient_id, date);

-- Outcome Measures
CREATE INDEX idx_outcome_measures_practice ON outcome_measures(practice_id);
CREATE INDEX idx_outcome_measures_patient ON outcome_measures(patient_id);
CREATE INDEX idx_outcome_measures_date ON outcome_measures(measurement_date);
CREATE INDEX idx_outcome_measures_type ON outcome_measures(measure_type);
CREATE INDEX idx_outcome_measures_patient_type ON outcome_measures(patient_id, measure_type);

-- Messages
CREATE INDEX idx_messages_practice ON messages(practice_id);
CREATE INDEX idx_messages_patient ON messages(patient_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_unread ON messages(patient_id, read) WHERE read = FALSE;

-- Invoices
CREATE INDEX idx_invoices_practice ON invoices(practice_id);
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_appointment ON invoices(appointment_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date_of_service);
CREATE INDEX idx_invoices_outstanding ON invoices(patient_id) WHERE balance > 0;

-- Priority Actions
CREATE INDEX idx_priority_actions_practice ON priority_actions(practice_id);
CREATE INDEX idx_priority_actions_patient ON priority_actions(patient_id);
CREATE INDEX idx_priority_actions_urgency ON priority_actions(urgency);
CREATE INDEX idx_priority_actions_status ON priority_actions(status);
CREATE INDEX idx_priority_actions_pending ON priority_actions(practice_id, status) WHERE status = 'pending';

-- Clinical Tasks
CREATE INDEX idx_clinical_tasks_practice ON clinical_tasks(practice_id);
CREATE INDEX idx_clinical_tasks_patient ON clinical_tasks(patient_id);
CREATE INDEX idx_clinical_tasks_action ON clinical_tasks(priority_action_id);
CREATE INDEX idx_clinical_tasks_status ON clinical_tasks(status);
CREATE INDEX idx_clinical_tasks_due ON clinical_tasks(due_date) WHERE status = 'pending';

-- AI Analysis Runs
CREATE INDEX idx_ai_runs_practice ON ai_analysis_runs(practice_id);
CREATE INDEX idx_ai_runs_batch ON ai_analysis_runs(batch_id);
CREATE INDEX idx_ai_runs_completed ON ai_analysis_runs(completed_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_runs ENABLE ROW LEVEL SECURITY;

-- Demo policies: Allow all operations (FOR HACKATHON ONLY)
-- In production, these would be locked down by user/practice
CREATE POLICY "demo_practices_all" ON practices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_patients_all" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_appointments_all" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_outcome_measures_all" ON outcome_measures FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_messages_all" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_invoices_all" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_priority_actions_all" ON priority_actions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_clinical_tasks_all" ON clinical_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_ai_runs_all" ON ai_analysis_runs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_practices_updated_at BEFORE UPDATE ON practices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_priority_actions_updated_at BEFORE UPDATE ON priority_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinical_tasks_updated_at BEFORE UPDATE ON clinical_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
