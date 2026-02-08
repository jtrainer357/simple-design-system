-- Mental Health MVP - Performance Indexes
-- Created: 2026-02-07
-- This migration adds advanced indexes for performance optimization

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================

-- pg_trgm for fuzzy text search (patient name search, etc.)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- btree_gist for exclusion constraints and range queries
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================
-- TRIGRAM INDEXES FOR FUZZY SEARCH
-- ============================================

-- Patient name search (supports LIKE, ILIKE, and similarity)
CREATE INDEX IF NOT EXISTS idx_patients_first_name_trgm
  ON patients USING GIN (first_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_patients_last_name_trgm
  ON patients USING GIN (last_name gin_trgm_ops);

-- Combined name search
CREATE INDEX IF NOT EXISTS idx_patients_full_name_trgm
  ON patients USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

-- Practice provider name search
CREATE INDEX IF NOT EXISTS idx_practice_providers_name_trgm
  ON practice_providers USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================

-- Dashboard: Today's appointments with patient info
CREATE INDEX IF NOT EXISTS idx_appointments_dashboard
  ON appointments (practice_id, date, status)
  WHERE deleted_at IS NULL;

-- Patient list: Active patients sorted by name
CREATE INDEX IF NOT EXISTS idx_patients_list
  ON patients (practice_id, last_name, first_name)
  WHERE deleted_at IS NULL AND status = 'Active';

-- Messages: Unread messages per patient
CREATE INDEX IF NOT EXISTS idx_messages_unread_patient
  ON messages (practice_id, patient_id, timestamp DESC)
  WHERE read = FALSE AND deleted_at IS NULL;

-- Invoices: Outstanding balances
CREATE INDEX IF NOT EXISTS idx_invoices_outstanding_balance
  ON invoices (practice_id, patient_id, balance DESC)
  WHERE balance > 0 AND deleted_at IS NULL;

-- Priority actions: Pending by urgency
CREATE INDEX IF NOT EXISTS idx_priority_actions_pending_urgency
  ON priority_actions (practice_id, urgency, created_at DESC)
  WHERE status = 'pending' AND deleted_at IS NULL;

-- Outcome measures: Latest per patient per type
CREATE INDEX IF NOT EXISTS idx_outcome_measures_latest
  ON outcome_measures (patient_id, measure_type, measurement_date DESC)
  WHERE deleted_at IS NULL;

-- Clinical observations: Recent per patient per type
CREATE INDEX IF NOT EXISTS idx_clinical_obs_recent
  ON clinical_observations (patient_id, observation_type, observation_date DESC)
  WHERE deleted_at IS NULL AND status = 'final';

-- ============================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- ============================================

-- High-risk patients
CREATE INDEX IF NOT EXISTS idx_patients_high_risk
  ON patients (practice_id, last_name, first_name)
  WHERE risk_level = 'high' AND deleted_at IS NULL AND status = 'Active';

-- Appointments needing attention (no-shows, cancellations)
CREATE INDEX IF NOT EXISTS idx_appointments_attention
  ON appointments (practice_id, date DESC)
  WHERE status IN ('No-Show', 'Cancelled') AND deleted_at IS NULL;

-- Urgent priority actions
CREATE INDEX IF NOT EXISTS idx_priority_actions_urgent
  ON priority_actions (practice_id, patient_id, created_at DESC)
  WHERE urgency = 'urgent' AND status = 'pending' AND deleted_at IS NULL;

-- Overdue clinical tasks
CREATE INDEX IF NOT EXISTS idx_clinical_tasks_overdue
  ON clinical_tasks (practice_id, due_date)
  WHERE status = 'pending' AND due_date < CURRENT_DATE AND deleted_at IS NULL;

-- ============================================
-- COVERING INDEXES (INCLUDE)
-- ============================================

-- Appointment list with commonly needed columns
CREATE INDEX IF NOT EXISTS idx_appointments_list_covering
  ON appointments (practice_id, date, start_time)
  INCLUDE (patient_id, status, service_type, duration_minutes)
  WHERE deleted_at IS NULL;

-- Patient quick lookup with display info
CREATE INDEX IF NOT EXISTS idx_patients_quick_lookup
  ON patients (practice_id, id)
  INCLUDE (first_name, last_name, status, risk_level, avatar_url)
  WHERE deleted_at IS NULL;

-- ============================================
-- BRIN INDEXES FOR TIME-SERIES DATA
-- ============================================

-- Messages timestamp (good for time-range queries on large tables)
CREATE INDEX IF NOT EXISTS idx_messages_timestamp_brin
  ON messages USING BRIN (timestamp)
  WITH (pages_per_range = 32);

-- AI analysis runs (append-only table)
CREATE INDEX IF NOT EXISTS idx_ai_runs_timestamp_brin
  ON ai_analysis_runs USING BRIN (completed_at)
  WITH (pages_per_range = 32);

-- ============================================
-- EXCLUSION CONSTRAINT FOR APPOINTMENT CONFLICTS
-- ============================================

-- Prevent overlapping appointments for the same patient
-- Note: Requires btree_gist extension

-- First, create a function to build time range
CREATE OR REPLACE FUNCTION appointment_time_range(date DATE, start_time TIME, end_time TIME)
RETURNS tstzrange AS $$
  SELECT tstzrange(
    (date + start_time)::TIMESTAMPTZ,
    (date + end_time)::TIMESTAMPTZ,
    '[)'
  );
$$ LANGUAGE SQL IMMUTABLE;

-- Add exclusion constraint (commented out - enable in production)
-- This prevents double-booking patients
-- ALTER TABLE appointments ADD CONSTRAINT no_overlapping_patient_appointments
--   EXCLUDE USING gist (
--     patient_id WITH =,
--     appointment_time_range(date, start_time, end_time) WITH &&
--   ) WHERE (status = 'Scheduled' AND deleted_at IS NULL);

-- ============================================
-- STATISTICS FOR QUERY OPTIMIZATION
-- ============================================

-- Extended statistics for correlated columns
CREATE STATISTICS IF NOT EXISTS stat_patients_practice_status
  ON practice_id, status FROM patients;

CREATE STATISTICS IF NOT EXISTS stat_appointments_practice_date_status
  ON practice_id, date, status FROM appointments;

CREATE STATISTICS IF NOT EXISTS stat_outcome_measures_patient_type
  ON patient_id, measure_type FROM outcome_measures;

-- ============================================
-- ANALYZE TABLES FOR STATISTICS
-- ============================================

-- Update table statistics after index creation
ANALYZE patients;
ANALYZE appointments;
ANALYZE outcome_measures;
ANALYZE messages;
ANALYZE invoices;
ANALYZE priority_actions;
ANALYZE clinical_tasks;
ANALYZE clinical_observations;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON EXTENSION pg_trgm IS 'Provides trigram-based text similarity and fuzzy search';
COMMENT ON EXTENSION btree_gist IS 'Provides B-tree equivalent GiST operators for exclusion constraints';

COMMENT ON INDEX idx_patients_full_name_trgm IS 'Trigram index for fuzzy patient name search (supports LIKE, ILIKE, similarity)';
COMMENT ON INDEX idx_appointments_dashboard IS 'Optimized for calendar/dashboard appointment queries';
COMMENT ON INDEX idx_patients_high_risk IS 'Partial index for quick high-risk patient lookups';
COMMENT ON INDEX idx_messages_timestamp_brin IS 'BRIN index for efficient time-range queries on large message history';
