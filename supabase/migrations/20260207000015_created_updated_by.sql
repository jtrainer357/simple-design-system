-- Mental Health MVP - Audit Tracking Fields
-- Created: 2026-02-07
-- This migration adds created_by and updated_by tracking to key tables

-- ============================================
-- USERS TABLE (already created by 20260207000001_users_roles.sql)
-- ============================================
-- Note: Users table is created in an earlier migration
-- Just enable RLS and add demo policy if not exists

-- Enable RLS on users (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Demo policy for users (drop and recreate to be safe)
DROP POLICY IF EXISTS "demo_users_all" ON users;
CREATE POLICY "demo_users_all" ON users FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ADD TRACKING COLUMNS TO KEY TABLES
-- ============================================

-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Priority Actions
ALTER TABLE priority_actions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE priority_actions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Clinical Tasks
ALTER TABLE clinical_tasks ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE clinical_tasks ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Outcome Measures
ALTER TABLE outcome_measures ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE outcome_measures ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Clinical Observations
ALTER TABLE clinical_observations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE clinical_observations ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES FOR TRACKING COLUMNS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_patients_created_by ON patients(created_by);
CREATE INDEX IF NOT EXISTS idx_patients_updated_by ON patients(updated_by);

CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_updated_by ON appointments(updated_by);

CREATE INDEX IF NOT EXISTS idx_messages_created_by ON messages(created_by);

CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_updated_by ON invoices(updated_by);

CREATE INDEX IF NOT EXISTS idx_priority_actions_created_by ON priority_actions(created_by);
CREATE INDEX IF NOT EXISTS idx_clinical_tasks_created_by ON clinical_tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_clinical_observations_created_by ON clinical_observations(created_by);
CREATE INDEX IF NOT EXISTS idx_outcome_measures_created_by ON outcome_measures(created_by);

-- ============================================
-- UPDATE_UPDATED_AT TRIGGER (Enhanced)
-- ============================================

-- Enhanced trigger function that also sets updated_by if available
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Note: updated_by should be set by the application layer
  -- since we don't have access to the current user in the trigger context
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- APPLY UPDATED_AT TRIGGER TO ALL TABLES
-- ============================================

-- Users (already created, just ensure trigger exists)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Outcome Measures (add updated_at and trigger)
ALTER TABLE outcome_measures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_outcome_measures_updated_at ON outcome_measures;
CREATE TRIGGER update_outcome_measures_updated_at
  BEFORE UPDATE ON outcome_measures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Messages (add updated_at and trigger)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Reviews (add updated_at and trigger)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUDIT LOG TABLE (Optional but Recommended)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  -- Action details
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore', 'login', 'logout', 'view')),
  table_name TEXT NOT NULL,
  record_id UUID,
  -- Change tracking
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  -- Context
  ip_address INET,
  user_agent TEXT,
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log indexes
CREATE INDEX idx_audit_log_practice ON audit_log(practice_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Index for recent audit entries (using timestamp DESC for efficient recent queries)
CREATE INDEX idx_audit_log_recent ON audit_log(practice_id, created_at DESC);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log is read-only for most users, write from application layer
CREATE POLICY "audit_log_read" ON audit_log
  FOR SELECT
  USING (true);

CREATE POLICY "audit_log_write" ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- HELPER FUNCTION: Log Audit Event
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_practice_id UUID,
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
  v_changed_fields TEXT[];
BEGIN
  -- Calculate changed fields if both old and new values provided
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT array_agg(key)
    INTO v_changed_fields
    FROM (
      SELECT key
      FROM jsonb_each(p_new_values)
      EXCEPT
      SELECT key
      FROM jsonb_each(p_old_values)
      WHERE p_old_values->key = p_new_values->key
    ) changed;
  END IF;

  INSERT INTO audit_log (
    practice_id,
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    changed_fields,
    ip_address,
    user_agent
  ) VALUES (
    p_practice_id,
    p_user_id,
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    v_changed_fields,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
