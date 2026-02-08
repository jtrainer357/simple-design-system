-- Mental Health MVP - Practice Specialty Support
-- Created: 2026-02-07
-- This migration adds specialty and provider type fields to practices

-- ============================================
-- ADD SPECIALTY COLUMNS TO PRACTICES
-- ============================================

-- Practice specialty (allows the system to be specialty-agnostic)
ALTER TABLE practices ADD COLUMN IF NOT EXISTS specialty TEXT DEFAULT 'mental_health';

-- Provider type for the practice
ALTER TABLE practices ADD COLUMN IF NOT EXISTS provider_type TEXT DEFAULT 'therapist';

-- Ensure settings column exists (should already exist but being safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'practices' AND column_name = 'settings'
  ) THEN
    ALTER TABLE practices ADD COLUMN settings JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- ADD CONSTRAINTS
-- ============================================

-- Add check constraint for valid specialties
ALTER TABLE practices DROP CONSTRAINT IF EXISTS practices_specialty_check;
ALTER TABLE practices ADD CONSTRAINT practices_specialty_check
  CHECK (specialty IN (
    'mental_health',
    'primary_care',
    'pediatrics',
    'internal_medicine',
    'family_medicine',
    'psychiatry',
    'psychology',
    'social_work',
    'counseling',
    'substance_abuse',
    'neurology',
    'geriatrics',
    'womens_health',
    'other'
  ));

-- Add check constraint for valid provider types
ALTER TABLE practices DROP CONSTRAINT IF EXISTS practices_provider_type_check;
ALTER TABLE practices ADD CONSTRAINT practices_provider_type_check
  CHECK (provider_type IN (
    'therapist',
    'psychiatrist',
    'psychologist',
    'counselor',
    'social_worker',
    'physician',
    'nurse_practitioner',
    'physician_assistant',
    'group_practice',
    'clinic',
    'other'
  ));

-- ============================================
-- DEFAULT SETTINGS STRUCTURE
-- ============================================
-- The settings JSONB column can include:
-- {
--   "appointment_defaults": {
--     "duration_minutes": 50,
--     "buffer_minutes": 10,
--     "default_service_type": "Individual Therapy"
--   },
--   "billing": {
--     "default_cpt_codes": ["90837", "90834"],
--     "accept_insurance": true
--   },
--   "notifications": {
--     "appointment_reminder_hours": 24,
--     "sms_enabled": true,
--     "email_enabled": true
--   },
--   "clinical": {
--     "default_outcome_measures": ["PHQ-9", "GAD-7"],
--     "outcome_measure_frequency_days": 14,
--     "risk_assessment_enabled": true
--   },
--   "features": {
--     "ai_priority_actions": true,
--     "voice_commands": true,
--     "telehealth": true
--   }
-- }

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_practices_specialty ON practices(specialty);
CREATE INDEX IF NOT EXISTS idx_practices_provider_type ON practices(provider_type);

-- GIN index for settings queries
CREATE INDEX IF NOT EXISTS idx_practices_settings ON practices USING GIN (settings);

-- ============================================
-- UPDATE EXISTING DEMO PRACTICE
-- ============================================

-- Update any existing practices with reasonable defaults
UPDATE practices
SET
  specialty = COALESCE(specialty, 'mental_health'),
  provider_type = COALESCE(provider_type, 'therapist'),
  settings = COALESCE(settings, '{}'::jsonb) || '{
    "appointment_defaults": {
      "duration_minutes": 50,
      "buffer_minutes": 10,
      "default_service_type": "Individual Therapy"
    },
    "clinical": {
      "default_outcome_measures": ["PHQ-9", "GAD-7"],
      "outcome_measure_frequency_days": 14,
      "risk_assessment_enabled": true
    },
    "features": {
      "ai_priority_actions": true,
      "voice_commands": true
    }
  }'::jsonb
WHERE specialty IS NULL OR provider_type IS NULL;
