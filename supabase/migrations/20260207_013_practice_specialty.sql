-- Mental Health MVP - Practice Specialty Support
-- Created: 2026-02-07
-- This migration adds specialty, provider_type, and enhanced settings to practices

-- ============================================
-- PRACTICE SPECIALTIES TABLE
-- ============================================
-- Lookup table for practice specialties

CREATE TABLE practice_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'mental_health', 'primary_care', 'specialty', 'allied_health'
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROVIDER TYPES TABLE
-- ============================================
-- Lookup table for provider types/credentials

CREATE TABLE provider_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL, -- 'MD', 'PhD', 'LCSW', 'NP', etc.
  description TEXT,
  can_prescribe BOOLEAN DEFAULT FALSE,
  can_supervise BOOLEAN DEFAULT FALSE,
  requires_supervision BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL, -- 'physician', 'psychologist', 'therapist', 'nurse', 'other'
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADD COLUMNS TO PRACTICES TABLE
-- ============================================

-- Add specialty reference
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS specialty_id UUID REFERENCES practice_specialties(id);

-- Add primary provider type
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS primary_provider_type_id UUID REFERENCES provider_types(id);

-- Add additional practice fields
ALTER TABLE practices
  ADD COLUMN IF NOT EXISTS npi TEXT, -- National Provider Identifier
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS fax TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_zip TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}}'::JSONB,
  ADD COLUMN IF NOT EXISTS is_accepting_patients BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS telehealth_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS in_person_enabled BOOLEAN DEFAULT TRUE;

-- ============================================
-- PRACTICE PROVIDERS (MANY-TO-MANY)
-- ============================================
-- Links providers/staff to practices

CREATE TABLE practice_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  provider_type_id UUID NOT NULL REFERENCES provider_types(id),

  -- Provider info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  npi TEXT,

  -- Credentials
  credentials TEXT[], -- Array of credentials: ['MD', 'FACP']
  license_number TEXT,
  license_state TEXT,
  license_expiration DATE,

  -- Supervision
  supervisor_id UUID REFERENCES practice_providers(id),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRACTICE SETTINGS SCHEMA
-- ============================================
-- Validate/document the settings JSONB structure

COMMENT ON COLUMN practices.settings IS 'Practice-level settings stored as JSONB. Schema:
{
  "scheduling": {
    "appointment_buffer_minutes": 15,
    "default_appointment_duration": 60,
    "allow_online_booking": true,
    "reminder_settings": {"sms": true, "email": true, "hours_before": [24, 2]}
  },
  "billing": {
    "default_cpt_codes": ["90837", "90834"],
    "accept_insurance": true,
    "insurance_payers": ["Aetna", "BlueCross", "United"],
    "sliding_scale_enabled": false
  },
  "clinical": {
    "required_measures": ["PHQ-9", "GAD-7"],
    "measure_frequency": "every-visit",
    "documentation_template": "soap"
  },
  "notifications": {
    "no_show_alerts": true,
    "high_risk_alerts": true,
    "outcome_deterioration_alerts": true
  },
  "integrations": {
    "ehr_system": null,
    "lab_system": null,
    "pharmacy_system": null
  },
  "branding": {
    "logo_url": null,
    "primary_color": "#coral",
    "portal_welcome_message": null
  }
}';

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Practice specialties
CREATE INDEX idx_practice_specs_code ON practice_specialties(code);
CREATE INDEX idx_practice_specs_category ON practice_specialties(category);
CREATE INDEX idx_practice_specs_active ON practice_specialties(is_active) WHERE is_active = TRUE;

-- Provider types
CREATE INDEX idx_provider_types_code ON provider_types(code);
CREATE INDEX idx_provider_types_category ON provider_types(category);
CREATE INDEX idx_provider_types_active ON provider_types(is_active) WHERE is_active = TRUE;

-- Practices
CREATE INDEX idx_practices_specialty ON practices(specialty_id);
CREATE INDEX idx_practices_provider_type ON practices(primary_provider_type_id);
CREATE INDEX idx_practices_accepting ON practices(is_accepting_patients) WHERE is_accepting_patients = TRUE;

-- Practice providers
CREATE INDEX idx_practice_providers_practice ON practice_providers(practice_id);
CREATE INDEX idx_practice_providers_type ON practice_providers(provider_type_id);
CREATE INDEX idx_practice_providers_active ON practice_providers(practice_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_practice_providers_supervisor ON practice_providers(supervisor_id) WHERE supervisor_id IS NOT NULL;
CREATE INDEX idx_practice_providers_name ON practice_providers(last_name, first_name);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE practice_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_providers ENABLE ROW LEVEL SECURITY;

-- Demo policies (FOR HACKATHON ONLY)
CREATE POLICY "demo_practice_specs_all" ON practice_specialties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_provider_types_all" ON provider_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_practice_providers_all" ON practice_providers FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_practice_providers_updated_at
  BEFORE UPDATE ON practice_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED PRACTICE SPECIALTIES
-- ============================================

INSERT INTO practice_specialties (code, name, description, category, display_order, is_active) VALUES
-- Mental Health Specialties
('PSYCH', 'Psychiatry', 'Medical specialty focused on diagnosis and treatment of mental disorders', 'mental_health', 1, TRUE),
('PSYCHOLOGY', 'Psychology', 'Clinical psychology and psychological assessment', 'mental_health', 2, TRUE),
('LCSW', 'Clinical Social Work', 'Licensed clinical social work practice', 'mental_health', 3, TRUE),
('COUNSELING', 'Counseling', 'Mental health counseling and therapy', 'mental_health', 4, TRUE),
('ADDICTION', 'Addiction Medicine', 'Substance use disorders and addiction treatment', 'mental_health', 5, TRUE),
('CHILD_PSYCH', 'Child & Adolescent Psychiatry', 'Mental health care for children and adolescents', 'mental_health', 6, TRUE),
('GERIATRIC_PSYCH', 'Geriatric Psychiatry', 'Mental health care for older adults', 'mental_health', 7, TRUE),
('NEUROPSYCH', 'Neuropsychology', 'Assessment of brain-behavior relationships', 'mental_health', 8, TRUE),

-- Primary Care
('FAMILY', 'Family Medicine', 'Primary care for all ages', 'primary_care', 10, TRUE),
('INTERNAL', 'Internal Medicine', 'Adult primary care', 'primary_care', 11, TRUE),
('PEDIATRICS', 'Pediatrics', 'Primary care for children', 'primary_care', 12, TRUE),

-- Allied Health
('OT', 'Occupational Therapy', 'Occupational therapy services', 'allied_health', 20, TRUE),
('ART_THERAPY', 'Art Therapy', 'Creative arts therapy', 'allied_health', 21, TRUE),
('MUSIC_THERAPY', 'Music Therapy', 'Music-based therapeutic interventions', 'allied_health', 22, TRUE);

-- ============================================
-- SEED PROVIDER TYPES
-- ============================================

INSERT INTO provider_types (code, name, abbreviation, description, can_prescribe, can_supervise, requires_supervision, category, display_order, is_active) VALUES
-- Physicians
('PSYCHIATRIST', 'Psychiatrist', 'MD/DO', 'Medical doctor specializing in psychiatry', TRUE, TRUE, FALSE, 'physician', 1, TRUE),
('PHYSICIAN', 'Physician', 'MD/DO', 'Medical doctor', TRUE, TRUE, FALSE, 'physician', 2, TRUE),

-- Advanced Practice
('PSYCH_NP', 'Psychiatric Nurse Practitioner', 'PMHNP', 'Nurse practitioner specializing in psychiatric care', TRUE, FALSE, FALSE, 'nurse', 5, TRUE),
('NP', 'Nurse Practitioner', 'NP', 'Advanced practice registered nurse', TRUE, FALSE, FALSE, 'nurse', 6, TRUE),
('PA', 'Physician Assistant', 'PA-C', 'Physician assistant', TRUE, FALSE, TRUE, 'physician', 7, TRUE),

-- Psychologists
('PSYCH_PHD', 'Clinical Psychologist (PhD)', 'PhD', 'Doctoral-level clinical psychologist', FALSE, TRUE, FALSE, 'psychologist', 10, TRUE),
('PSYCH_PSYD', 'Clinical Psychologist (PsyD)', 'PsyD', 'Doctoral-level clinical psychologist', FALSE, TRUE, FALSE, 'psychologist', 11, TRUE),

-- Licensed Therapists
('LCSW', 'Licensed Clinical Social Worker', 'LCSW', 'Licensed clinical social worker', FALSE, TRUE, FALSE, 'therapist', 15, TRUE),
('LMFT', 'Licensed Marriage & Family Therapist', 'LMFT', 'Licensed marriage and family therapist', FALSE, TRUE, FALSE, 'therapist', 16, TRUE),
('LPC', 'Licensed Professional Counselor', 'LPC', 'Licensed professional counselor', FALSE, TRUE, FALSE, 'therapist', 17, TRUE),
('LCPC', 'Licensed Clinical Professional Counselor', 'LCPC', 'Licensed clinical professional counselor', FALSE, TRUE, FALSE, 'therapist', 18, TRUE),

-- Pre-Licensed/Supervised
('MSW', 'Master of Social Work', 'MSW', 'Pre-licensed social worker', FALSE, FALSE, TRUE, 'therapist', 20, TRUE),
('MFT_INTERN', 'MFT Intern', 'MFTI', 'Marriage and family therapy intern', FALSE, FALSE, TRUE, 'therapist', 21, TRUE),
('PSYCH_INTERN', 'Psychology Intern', 'Intern', 'Pre-doctoral psychology intern', FALSE, FALSE, TRUE, 'psychologist', 22, TRUE),

-- Other
('RN', 'Registered Nurse', 'RN', 'Registered nurse', FALSE, FALSE, FALSE, 'nurse', 25, TRUE),
('PEER_SPEC', 'Peer Specialist', 'CPS', 'Certified peer support specialist', FALSE, FALSE, TRUE, 'other', 30, TRUE),
('ADMIN', 'Practice Administrator', 'Admin', 'Non-clinical administrative staff', FALSE, FALSE, FALSE, 'other', 35, TRUE);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE practice_specialties IS 'Lookup table for practice specialties (psychiatry, psychology, counseling, etc.)';
COMMENT ON TABLE provider_types IS 'Lookup table for provider types/credentials with prescribing and supervision capabilities';
COMMENT ON TABLE practice_providers IS 'Links providers to practices with credentials and supervision relationships';
COMMENT ON COLUMN practice_providers.supervisor_id IS 'Self-referential FK for supervision relationships (pre-licensed providers)';
