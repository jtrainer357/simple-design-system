-- Mental Health MVP - Soft Delete Support
-- Created: 2026-02-07
-- This migration adds soft delete capability to key tables

-- ============================================
-- ADD deleted_at COLUMN TO TABLES
-- ============================================

-- Patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Priority Actions
ALTER TABLE priority_actions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Clinical Tasks
ALTER TABLE clinical_tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================
-- CREATE INDEXES FOR SOFT DELETE QUERIES
-- ============================================

-- Partial indexes for active (non-deleted) records - most common query pattern
CREATE INDEX IF NOT EXISTS idx_patients_active ON patients(practice_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_active ON appointments(practice_id, date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_active ON messages(practice_id, patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_active ON invoices(practice_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_active ON reviews(practice_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_priority_actions_active ON priority_actions(practice_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_clinical_tasks_active ON clinical_tasks(practice_id) WHERE deleted_at IS NULL;

-- Indexes for deleted_at column for trash/archive queries
CREATE INDEX IF NOT EXISTS idx_patients_deleted_at ON patients(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_deleted_at ON appointments(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- HELPER FUNCTIONS FOR SOFT DELETE
-- ============================================

-- Function to soft delete a record
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a soft-deleted record
CREATE OR REPLACE FUNCTION restore_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR ACTIVE (NON-DELETED) RECORDS
-- ============================================

-- Active patients view
CREATE OR REPLACE VIEW active_patients AS
SELECT * FROM patients WHERE deleted_at IS NULL;

-- Active appointments view
CREATE OR REPLACE VIEW active_appointments AS
SELECT * FROM appointments WHERE deleted_at IS NULL;

-- Active messages view
CREATE OR REPLACE VIEW active_messages AS
SELECT * FROM messages WHERE deleted_at IS NULL;

-- Active invoices view
CREATE OR REPLACE VIEW active_invoices AS
SELECT * FROM invoices WHERE deleted_at IS NULL;

-- Active priority actions view
CREATE OR REPLACE VIEW active_priority_actions AS
SELECT * FROM priority_actions WHERE deleted_at IS NULL;

-- Active clinical tasks view
CREATE OR REPLACE VIEW active_clinical_tasks AS
SELECT * FROM clinical_tasks WHERE deleted_at IS NULL;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN patients.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN appointments.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN invoices.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN reviews.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN priority_actions.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
COMMENT ON COLUMN clinical_tasks.deleted_at IS 'Soft delete timestamp. NULL means active, non-NULL means deleted.';
