-- Mental Health MVP - Clinical Observations
-- Created: 2026-02-07
-- This migration adds flexible clinical observations with JSONB support

-- ============================================
-- CLINICAL OBSERVATIONS TABLE
-- ============================================
-- Supports structured clinical observations with flexible value types
-- and reference ranges for lab results, vitals, assessments, etc.

CREATE TABLE clinical_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Observation identification
  observation_type TEXT NOT NULL, -- 'vital', 'lab', 'assessment', 'measurement', 'note'
  code TEXT, -- Standard code (LOINC, SNOMED, internal)
  code_system TEXT, -- 'LOINC', 'SNOMED', 'ICD-10', 'internal'
  name TEXT NOT NULL, -- Human readable name (e.g., "Blood Pressure", "Weight", "PHQ-9 Item 1")

  -- Flexible value storage with JSONB
  -- Examples:
  -- Simple number: {"numeric": 120, "unit": "mmHg"}
  -- Range value: {"systolic": 120, "diastolic": 80, "unit": "mmHg"}
  -- Text: {"text": "Patient reports improved mood"}
  -- Boolean: {"boolean": true}
  -- Coded: {"code": "positive", "display": "Positive"}
  value JSONB NOT NULL,

  -- Reference ranges (for lab results, vitals, etc.)
  -- Example: {"low": 70, "high": 100, "unit": "mg/dL", "interpretation": "normal"}
  reference_range JSONB,

  -- Interpretation
  interpretation TEXT, -- 'normal', 'abnormal', 'critical', 'high', 'low', etc.
  interpretation_code TEXT, -- HL7 interpretation code

  -- Context
  observation_date TIMESTAMPTZ NOT NULL,
  effective_period_start TIMESTAMPTZ, -- For observations over a period
  effective_period_end TIMESTAMPTZ,

  -- Source
  performed_by TEXT, -- Who took the observation
  method TEXT, -- How it was measured (e.g., 'automated', 'manual', 'self-reported')
  device TEXT, -- Device used
  body_site TEXT, -- Where on body (for vitals, etc.)

  -- Related observations (for grouped observations like vital signs panel)
  parent_observation_id UUID REFERENCES clinical_observations(id) ON DELETE SET NULL,

  -- Clinical notes
  notes TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'final' CHECK (status IN ('preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error')),

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OBSERVATION TEMPLATES
-- ============================================
-- Pre-defined templates for common observations

CREATE TABLE observation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE, -- NULL for system templates

  -- Template identification
  name TEXT NOT NULL,
  observation_type TEXT NOT NULL,
  code TEXT,
  code_system TEXT,

  -- Default value schema
  value_schema JSONB NOT NULL, -- JSON Schema for validation

  -- Default reference range
  default_reference_range JSONB,

  -- UI hints
  input_type TEXT, -- 'number', 'text', 'select', 'range', etc.
  unit TEXT,
  display_order INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Main lookup patterns
CREATE INDEX idx_clinical_obs_practice ON clinical_observations(practice_id);
CREATE INDEX idx_clinical_obs_patient ON clinical_observations(patient_id);
CREATE INDEX idx_clinical_obs_type ON clinical_observations(observation_type);
CREATE INDEX idx_clinical_obs_code ON clinical_observations(code);
CREATE INDEX idx_clinical_obs_date ON clinical_observations(observation_date);

-- Active observations (most common query)
CREATE INDEX idx_clinical_obs_active ON clinical_observations(patient_id, observation_date)
  WHERE deleted_at IS NULL AND status = 'final';

-- Patient + type queries
CREATE INDEX idx_clinical_obs_patient_type ON clinical_observations(patient_id, observation_type, observation_date DESC);

-- JSONB indexes for value queries
CREATE INDEX idx_clinical_obs_value_gin ON clinical_observations USING GIN (value);
CREATE INDEX idx_clinical_obs_ref_range_gin ON clinical_observations USING GIN (reference_range);

-- Parent observation lookups
CREATE INDEX idx_clinical_obs_parent ON clinical_observations(parent_observation_id)
  WHERE parent_observation_id IS NOT NULL;

-- Templates
CREATE INDEX idx_obs_templates_practice ON observation_templates(practice_id);
CREATE INDEX idx_obs_templates_type ON observation_templates(observation_type);
CREATE INDEX idx_obs_templates_active ON observation_templates(practice_id, observation_type)
  WHERE is_active = TRUE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE clinical_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation_templates ENABLE ROW LEVEL SECURITY;

-- Demo policies (FOR HACKATHON ONLY)
CREATE POLICY "demo_clinical_obs_all" ON clinical_observations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "demo_obs_templates_all" ON observation_templates FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on changes
CREATE TRIGGER update_clinical_obs_updated_at
  BEFORE UPDATE ON clinical_observations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obs_templates_updated_at
  BEFORE UPDATE ON observation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED COMMON OBSERVATION TEMPLATES
-- ============================================

INSERT INTO observation_templates (name, observation_type, code, code_system, value_schema, default_reference_range, input_type, unit, display_order, is_active) VALUES
-- Vital Signs
('Weight', 'vital', '29463-7', 'LOINC',
  '{"type": "object", "properties": {"numeric": {"type": "number"}, "unit": {"type": "string", "enum": ["kg", "lbs"]}}}',
  NULL, 'number', 'lbs', 1, TRUE),

('Height', 'vital', '8302-2', 'LOINC',
  '{"type": "object", "properties": {"numeric": {"type": "number"}, "unit": {"type": "string", "enum": ["cm", "in"]}}}',
  NULL, 'number', 'in', 2, TRUE),

('Blood Pressure', 'vital', '85354-9', 'LOINC',
  '{"type": "object", "properties": {"systolic": {"type": "number"}, "diastolic": {"type": "number"}, "unit": {"type": "string"}}}',
  '{"systolic": {"low": 90, "high": 120}, "diastolic": {"low": 60, "high": 80}, "unit": "mmHg"}',
  'range', 'mmHg', 3, TRUE),

('Heart Rate', 'vital', '8867-4', 'LOINC',
  '{"type": "object", "properties": {"numeric": {"type": "number"}, "unit": {"type": "string"}}}',
  '{"low": 60, "high": 100, "unit": "bpm"}',
  'number', 'bpm', 4, TRUE),

('Body Temperature', 'vital', '8310-5', 'LOINC',
  '{"type": "object", "properties": {"numeric": {"type": "number"}, "unit": {"type": "string", "enum": ["F", "C"]}}}',
  '{"low": 97.8, "high": 99.1, "unit": "F"}',
  'number', 'F', 5, TRUE),

-- Mental Health Specific
('Suicidal Ideation Screen', 'assessment', 'internal-si-screen', 'internal',
  '{"type": "object", "properties": {"present": {"type": "boolean"}, "severity": {"type": "string", "enum": ["none", "passive", "active-no-plan", "active-with-plan"]}, "notes": {"type": "string"}}}',
  NULL, 'select', NULL, 10, TRUE),

('Sleep Quality', 'assessment', 'internal-sleep', 'internal',
  '{"type": "object", "properties": {"hours": {"type": "number"}, "quality": {"type": "string", "enum": ["poor", "fair", "good", "excellent"]}, "disturbances": {"type": "boolean"}}}',
  '{"hours": {"low": 7, "high": 9}}',
  'number', 'hours', 11, TRUE),

('Mood Rating', 'assessment', 'internal-mood', 'internal',
  '{"type": "object", "properties": {"numeric": {"type": "number", "minimum": 0, "maximum": 10}, "description": {"type": "string"}}}',
  NULL, 'number', NULL, 12, TRUE),

('Anxiety Level', 'assessment', 'internal-anxiety', 'internal',
  '{"type": "object", "properties": {"numeric": {"type": "number", "minimum": 0, "maximum": 10}, "description": {"type": "string"}}}',
  NULL, 'number', NULL, 13, TRUE);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE clinical_observations IS 'Flexible clinical observations with JSONB value storage for any observation type (vitals, labs, assessments)';
COMMENT ON COLUMN clinical_observations.value IS 'JSONB structure containing the observation value. Format varies by observation_type.';
COMMENT ON COLUMN clinical_observations.reference_range IS 'JSONB structure defining normal/expected ranges for this observation';
COMMENT ON TABLE observation_templates IS 'Pre-defined templates for common observations with validation schemas';
