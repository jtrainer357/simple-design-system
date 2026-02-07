-- Mental Health MVP - Performance Indexes
-- Created: 2026-02-07
-- This migration adds additional indexes for common query patterns

-- ============================================
-- ENABLE PG_TRGM EXTENSION FOR FUZZY SEARCH
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- TRIGRAM INDEXES FOR FUZZY PATIENT SEARCH
-- ============================================

-- Trigram index on patient first_name for fuzzy/typo-tolerant search
CREATE INDEX IF NOT EXISTS idx_patients_first_name_trgm
  ON patients USING GIN (first_name gin_trgm_ops);

-- Trigram index on patient last_name for fuzzy/typo-tolerant search
CREATE INDEX IF NOT EXISTS idx_patients_last_name_trgm
  ON patients USING GIN (last_name gin_trgm_ops);

-- Combined trigram index on full name (generated column approach)
-- First, add a generated column for full name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patients' AND column_name = 'full_name_search'
  ) THEN
    ALTER TABLE patients ADD COLUMN full_name_search TEXT
      GENERATED ALWAYS AS (lower(first_name || ' ' || last_name)) STORED;
  END IF;
END $$;

-- Create trigram index on the full name search column
CREATE INDEX IF NOT EXISTS idx_patients_full_name_trgm
  ON patients USING GIN (full_name_search gin_trgm_ops);

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERY PATTERNS
-- ============================================

-- Appointments: Patient's appointments sorted by most recent
DROP INDEX IF EXISTS idx_appointments_patient_start_desc;
CREATE INDEX idx_appointments_patient_start_desc
  ON appointments(patient_id, date DESC, start_time DESC)
  WHERE deleted_at IS NULL;

-- Messages: Conversation thread ordering
DROP INDEX IF EXISTS idx_messages_conversation_created;
CREATE INDEX idx_messages_conversation_created
  ON messages(patient_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- Priority Actions: Patient's pending actions by urgency
DROP INDEX IF EXISTS idx_priority_actions_patient_urgency;
CREATE INDEX idx_priority_actions_patient_urgency
  ON priority_actions(patient_id, urgency, created_at DESC)
  WHERE status = 'pending';

-- Priority Actions: Practice-wide pending actions
DROP INDEX IF EXISTS idx_priority_actions_practice_pending;
CREATE INDEX idx_priority_actions_practice_pending
  ON priority_actions(practice_id, urgency, created_at DESC)
  WHERE status = 'pending';

-- Outcome Measures: Patient's measures by type and date
DROP INDEX IF EXISTS idx_outcome_measures_patient_type_date;
CREATE INDEX idx_outcome_measures_patient_type_date
  ON outcome_measures(patient_id, measure_type, measurement_date DESC);

-- Invoices: Outstanding balances by patient
DROP INDEX IF EXISTS idx_invoices_patient_outstanding;
CREATE INDEX idx_invoices_patient_outstanding
  ON invoices(patient_id, date_of_service DESC)
  WHERE balance > 0 AND deleted_at IS NULL;

-- ============================================
-- PARTIAL INDEXES FOR ACTIVE/UPCOMING RECORDS
-- ============================================

-- Active patients only (most common query)
DROP INDEX IF EXISTS idx_patients_active;
CREATE INDEX idx_patients_active
  ON patients(practice_id, last_name, first_name)
  WHERE status = 'Active' AND deleted_at IS NULL;

-- Upcoming appointments (next 30 days is common dashboard query)
DROP INDEX IF EXISTS idx_appointments_upcoming;
CREATE INDEX idx_appointments_upcoming
  ON appointments(practice_id, date, start_time)
  WHERE status = 'Scheduled' AND deleted_at IS NULL;

-- Today's appointments (very common query for daily view)
DROP INDEX IF EXISTS idx_appointments_today;
CREATE INDEX idx_appointments_today
  ON appointments(practice_id, patient_id, start_time)
  WHERE status = 'Scheduled' AND deleted_at IS NULL;

-- Unread messages
DROP INDEX IF EXISTS idx_messages_unread;
CREATE INDEX idx_messages_unread_new
  ON messages(practice_id, patient_id, created_at DESC)
  WHERE read = FALSE AND deleted_at IS NULL;

-- Pending clinical tasks
DROP INDEX IF EXISTS idx_clinical_tasks_pending;
CREATE INDEX idx_clinical_tasks_pending_new
  ON clinical_tasks(practice_id, patient_id, due_date)
  WHERE status = 'pending';

-- ============================================
-- COVERING INDEXES FOR COMMON SELECTS
-- ============================================

-- Patient list view covering index (avoids heap access for common columns)
DROP INDEX IF EXISTS idx_patients_list_covering;
CREATE INDEX idx_patients_list_covering
  ON patients(practice_id, last_name, first_name)
  INCLUDE (id, email, phone_mobile, risk_level, status, avatar_url)
  WHERE status = 'Active' AND deleted_at IS NULL;

-- Appointment calendar covering index
DROP INDEX IF EXISTS idx_appointments_calendar_covering;
CREATE INDEX idx_appointments_calendar_covering
  ON appointments(practice_id, date, start_time)
  INCLUDE (id, patient_id, end_time, duration_minutes, service_type, status, location)
  WHERE deleted_at IS NULL;

-- ============================================
-- BRIN INDEXES FOR TIME-SERIES DATA
-- ============================================

-- BRIN index for appointment dates (efficient for date range queries)
DROP INDEX IF EXISTS idx_appointments_date_brin;
CREATE INDEX idx_appointments_date_brin
  ON appointments USING BRIN (date)
  WITH (pages_per_range = 32);

-- BRIN index for message timestamps
DROP INDEX IF EXISTS idx_messages_timestamp_brin;
CREATE INDEX idx_messages_timestamp_brin
  ON messages USING BRIN (created_at)
  WITH (pages_per_range = 32);

-- BRIN index for outcome measure dates
DROP INDEX IF EXISTS idx_outcome_measures_date_brin;
CREATE INDEX idx_outcome_measures_date_brin
  ON outcome_measures USING BRIN (measurement_date)
  WITH (pages_per_range = 32);

-- ============================================
-- FUNCTION: Fuzzy Patient Search
-- ============================================

-- Function to search patients with fuzzy matching
CREATE OR REPLACE FUNCTION search_patients_fuzzy(
  p_practice_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pat.id,
    pat.first_name,
    pat.last_name,
    pat.first_name || ' ' || pat.last_name AS full_name,
    GREATEST(
      similarity(pat.first_name, p_query),
      similarity(pat.last_name, p_query),
      similarity(pat.full_name_search, lower(p_query))
    ) AS similarity_score
  FROM patients pat
  WHERE
    pat.practice_id = p_practice_id
    AND pat.status = 'Active'
    AND pat.deleted_at IS NULL
    AND (
      pat.first_name % p_query
      OR pat.last_name % p_query
      OR pat.full_name_search % lower(p_query)
    )
  ORDER BY similarity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Set similarity threshold for fuzzy matching
SELECT set_limit(0.3);
