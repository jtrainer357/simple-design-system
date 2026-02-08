-- Mental Health MVP - Tracking Fields (created_by, updated_by)
-- Created: 2026-02-07
-- This migration adds user tracking fields to key tables

-- ============================================
-- ADD TRACKING COLUMNS TO TABLES
-- ============================================

-- Patients
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Appointments
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Outcome Measures
ALTER TABLE outcome_measures
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Invoices
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Priority Actions
ALTER TABLE priority_actions
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Clinical Tasks
ALTER TABLE clinical_tasks
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Clinical Observations
ALTER TABLE clinical_observations
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Reviews
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Practice Providers
-- (already has updated_at from previous migration)
ALTER TABLE practice_providers
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Practices
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

-- ============================================
-- TRIGGER TO AUTO-UPDATE updated_by
-- ============================================

-- Create function to update both updated_at and updated_by
-- Note: In production, this would get the user ID from the session context
CREATE OR REPLACE FUNCTION update_tracking_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- updated_by should be set by the application layer
  -- If not set, keep the previous value
  IF NEW.updated_by IS NULL THEN
    NEW.updated_by = OLD.updated_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Replace existing update triggers to use new function
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_tracking
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_tracking
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_tracking
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_priority_actions_updated_at ON priority_actions;
CREATE TRIGGER update_priority_actions_tracking
  BEFORE UPDATE ON priority_actions
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_clinical_tasks_updated_at ON clinical_tasks;
CREATE TRIGGER update_clinical_tasks_tracking
  BEFORE UPDATE ON clinical_tasks
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_clinical_obs_updated_at ON clinical_observations;
CREATE TRIGGER update_clinical_obs_tracking
  BEFORE UPDATE ON clinical_observations
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_practice_providers_updated_at ON practice_providers;
CREATE TRIGGER update_practice_providers_tracking
  BEFORE UPDATE ON practice_providers
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

DROP TRIGGER IF EXISTS update_practices_updated_at ON practices;
CREATE TRIGGER update_practices_tracking
  BEFORE UPDATE ON practices
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

-- Add triggers for tables that didn't have updated_at before
CREATE TRIGGER update_outcome_measures_tracking
  BEFORE UPDATE ON outcome_measures
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

CREATE TRIGGER update_messages_tracking
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

CREATE TRIGGER update_reviews_tracking
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tracking_columns();

-- ============================================
-- AUDIT LOG TABLE (Optional - for full audit trail)
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- What changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'RESTORE')),
  -- Who changed it
  user_id UUID,
  user_email TEXT,
  user_ip TEXT,
  -- What was changed
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  -- When
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_record ON audit_log(record_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- Composite index for common query: "Show me all changes to this record"
CREATE INDEX idx_audit_log_record_time ON audit_log(record_id, created_at DESC);

-- BRIN index for time-series queries on large audit tables
CREATE INDEX idx_audit_log_created_brin ON audit_log USING BRIN (created_at);

-- RLS for audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demo_audit_log_all" ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FUNCTION TO LOG CHANGES (for application use)
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_event(
  p_table_name TEXT,
  p_record_id UUID,
  p_action TEXT,
  p_user_id UUID DEFAULT NULL,
  p_user_email TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_changed_fields TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO audit_log (
    table_name, record_id, action,
    user_id, user_email,
    old_values, new_values, changed_fields
  ) VALUES (
    p_table_name, p_record_id, p_action,
    p_user_id, p_user_email,
    p_old_values, p_new_values, p_changed_fields
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEW FOR RECENT ACTIVITY
-- ============================================

CREATE OR REPLACE VIEW recent_activity AS
SELECT
  al.id,
  al.table_name,
  al.record_id,
  al.action,
  al.user_id,
  al.user_email,
  al.changed_fields,
  al.created_at,
  -- Join with practices for context
  CASE al.table_name
    WHEN 'patients' THEN (SELECT p.practice_id FROM patients p WHERE p.id = al.record_id)
    WHEN 'appointments' THEN (SELECT a.practice_id FROM appointments a WHERE a.id = al.record_id)
    ELSE NULL
  END as practice_id
FROM audit_log al
ORDER BY al.created_at DESC;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN patients.created_by IS 'UUID of the user who created this record';
COMMENT ON COLUMN patients.updated_by IS 'UUID of the user who last updated this record';

COMMENT ON TABLE audit_log IS 'Comprehensive audit trail for tracking all data changes';
COMMENT ON COLUMN audit_log.old_values IS 'JSONB snapshot of record before change (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_log.new_values IS 'JSONB snapshot of record after change (for INSERT/UPDATE)';
COMMENT ON COLUMN audit_log.changed_fields IS 'Array of field names that were modified';

COMMENT ON FUNCTION log_audit_event IS 'Helper function to log audit events from application code';
