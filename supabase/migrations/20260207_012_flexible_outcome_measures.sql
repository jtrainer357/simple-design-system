-- Mental Health MVP - Flexible Outcome Measures
-- Created: 2026-02-07
-- This migration adds extensible outcome measure definitions

-- ============================================
-- OUTCOME MEASURE DEFINITIONS TABLE
-- ============================================
-- Stores the definition/metadata for each outcome measure type
-- Allows practices to add custom measures beyond PHQ-9, GAD-7, etc.

CREATE TABLE outcome_measure_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE, -- NULL for system-wide measures

  -- Identification
  code TEXT NOT NULL, -- 'PHQ-9', 'GAD-7', 'PCL-5', 'AUDIT-C', etc.
  name TEXT NOT NULL, -- Full name
  description TEXT, -- Description of what it measures
  version TEXT, -- Version number for standardized measures

  -- Classification
  category TEXT NOT NULL, -- 'depression', 'anxiety', 'trauma', 'substance', 'general', 'custom'
  subcategory TEXT, -- More specific classification

  -- Scoring
  min_score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  score_interpretation JSONB NOT NULL, -- Severity thresholds
  -- Example: [{"min": 0, "max": 4, "severity": "none", "label": "Minimal"}, {"min": 5, "max": 9, "severity": "mild", "label": "Mild"}]

  -- Questions/Items (for self-report measures)
  items JSONB, -- Array of question definitions
  -- Example: [{"id": 1, "text": "Little interest or pleasure...", "min": 0, "max": 3, "labels": ["Not at all", "Several days", "More than half", "Nearly every day"]}]

  -- Clinical guidance
  clinical_guidance JSONB, -- When to use, frequency, clinical notes
  evidence_base TEXT, -- Citations, validation studies

  -- Administration
  typical_duration_minutes INTEGER, -- How long to complete
  administration_method TEXT, -- 'self-report', 'clinician-administered', 'interview'
  frequency_recommendation TEXT, -- 'every-visit', 'weekly', 'monthly', 'initial-only'

  -- Status
  is_system_measure BOOLEAN DEFAULT FALSE, -- TRUE for built-in measures
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint for code per practice
  CONSTRAINT unique_measure_code UNIQUE (practice_id, code)
);

-- ============================================
-- ADD REFERENCE TO OUTCOME MEASURES TABLE
-- ============================================

-- Add definition reference to existing outcome_measures table
ALTER TABLE outcome_measures
  ADD COLUMN IF NOT EXISTS definition_id UUID REFERENCES outcome_measure_definitions(id) ON DELETE SET NULL;

-- Add item-level responses (for detailed analysis)
ALTER TABLE outcome_measures
  ADD COLUMN IF NOT EXISTS item_responses JSONB;
-- Example: [{"item_id": 1, "response": 2}, {"item_id": 2, "response": 3}]

-- Add severity classification
ALTER TABLE outcome_measures
  ADD COLUMN IF NOT EXISTS severity TEXT;

-- Add clinical notes specific to this administration
ALTER TABLE outcome_measures
  ADD COLUMN IF NOT EXISTS clinical_notes TEXT;

-- Add soft delete
ALTER TABLE outcome_measures
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Outcome measure definitions
CREATE INDEX idx_measure_defs_practice ON outcome_measure_definitions(practice_id);
CREATE INDEX idx_measure_defs_code ON outcome_measure_definitions(code);
CREATE INDEX idx_measure_defs_category ON outcome_measure_definitions(category);
CREATE INDEX idx_measure_defs_active ON outcome_measure_definitions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_measure_defs_system ON outcome_measure_definitions(is_system_measure) WHERE is_system_measure = TRUE;

-- Outcome measures with definition
CREATE INDEX idx_outcome_measures_def ON outcome_measures(definition_id);
CREATE INDEX idx_outcome_measures_severity ON outcome_measures(severity);
CREATE INDEX idx_outcome_measures_active ON outcome_measures(patient_id, measurement_date)
  WHERE deleted_at IS NULL;

-- JSONB indexes for item responses
CREATE INDEX idx_outcome_measures_items_gin ON outcome_measures USING GIN (item_responses);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE outcome_measure_definitions ENABLE ROW LEVEL SECURITY;

-- Demo policy (FOR HACKATHON ONLY)
CREATE POLICY "demo_measure_defs_all" ON outcome_measure_definitions FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_measure_defs_updated_at
  BEFORE UPDATE ON outcome_measure_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED STANDARD OUTCOME MEASURES
-- ============================================

INSERT INTO outcome_measure_definitions (
  code, name, description, version, category, min_score, max_score,
  score_interpretation, items, clinical_guidance, typical_duration_minutes,
  administration_method, frequency_recommendation, is_system_measure, is_active
) VALUES

-- PHQ-9 (Depression)
('PHQ-9', 'Patient Health Questionnaire-9',
 'A 9-item self-report measure for assessing the severity of depressive symptoms based on DSM-5 criteria.',
 '1.0', 'depression', 0, 27,
 '[
   {"min": 0, "max": 4, "severity": "none", "label": "Minimal depression"},
   {"min": 5, "max": 9, "severity": "mild", "label": "Mild depression"},
   {"min": 10, "max": 14, "severity": "moderate", "label": "Moderate depression"},
   {"min": 15, "max": 19, "severity": "moderately_severe", "label": "Moderately severe depression"},
   {"min": 20, "max": 27, "severity": "severe", "label": "Severe depression"}
 ]'::JSONB,
 '[
   {"id": 1, "text": "Little interest or pleasure in doing things", "min": 0, "max": 3},
   {"id": 2, "text": "Feeling down, depressed, or hopeless", "min": 0, "max": 3},
   {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much", "min": 0, "max": 3},
   {"id": 4, "text": "Feeling tired or having little energy", "min": 0, "max": 3},
   {"id": 5, "text": "Poor appetite or overeating", "min": 0, "max": 3},
   {"id": 6, "text": "Feeling bad about yourself - or that you are a failure or have let yourself or your family down", "min": 0, "max": 3},
   {"id": 7, "text": "Trouble concentrating on things, such as reading the newspaper or watching television", "min": 0, "max": 3},
   {"id": 8, "text": "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual", "min": 0, "max": 3},
   {"id": 9, "text": "Thoughts that you would be better off dead, or of hurting yourself in some way", "min": 0, "max": 3}
 ]'::JSONB,
 '{"recommended_use": "Initial assessment and ongoing monitoring of depression", "action_thresholds": {"10": "Consider treatment", "15": "Active treatment warranted", "20": "Immediate intervention"}}'::JSONB,
 5, 'self-report', 'every-visit', TRUE, TRUE
),

-- GAD-7 (Anxiety)
('GAD-7', 'Generalized Anxiety Disorder 7-item Scale',
 'A 7-item self-report measure for assessing the severity of generalized anxiety disorder symptoms.',
 '1.0', 'anxiety', 0, 21,
 '[
   {"min": 0, "max": 4, "severity": "none", "label": "Minimal anxiety"},
   {"min": 5, "max": 9, "severity": "mild", "label": "Mild anxiety"},
   {"min": 10, "max": 14, "severity": "moderate", "label": "Moderate anxiety"},
   {"min": 15, "max": 21, "severity": "severe", "label": "Severe anxiety"}
 ]'::JSONB,
 '[
   {"id": 1, "text": "Feeling nervous, anxious, or on edge", "min": 0, "max": 3},
   {"id": 2, "text": "Not being able to stop or control worrying", "min": 0, "max": 3},
   {"id": 3, "text": "Worrying too much about different things", "min": 0, "max": 3},
   {"id": 4, "text": "Trouble relaxing", "min": 0, "max": 3},
   {"id": 5, "text": "Being so restless that it''s hard to sit still", "min": 0, "max": 3},
   {"id": 6, "text": "Becoming easily annoyed or irritable", "min": 0, "max": 3},
   {"id": 7, "text": "Feeling afraid, as if something awful might happen", "min": 0, "max": 3}
 ]'::JSONB,
 '{"recommended_use": "Initial assessment and ongoing monitoring of anxiety", "action_thresholds": {"10": "Consider treatment", "15": "Active treatment warranted"}}'::JSONB,
 3, 'self-report', 'every-visit', TRUE, TRUE
),

-- PCL-5 (PTSD)
('PCL-5', 'PTSD Checklist for DSM-5',
 'A 20-item self-report measure for assessing PTSD symptoms based on DSM-5 criteria.',
 '1.0', 'trauma', 0, 80,
 '[
   {"min": 0, "max": 30, "severity": "none", "label": "Below threshold"},
   {"min": 31, "max": 33, "severity": "probable", "label": "Probable PTSD (clinical cutoff)"},
   {"min": 34, "max": 80, "severity": "severe", "label": "PTSD likely"}
 ]'::JSONB,
 NULL, -- Full 20 items omitted for brevity
 '{"recommended_use": "Assessment of PTSD in trauma-exposed individuals", "clinical_cutoff": 31, "note": "Consider using in conjunction with clinician interview"}'::JSONB,
 10, 'self-report', 'monthly', TRUE, TRUE
),

-- AUDIT-C (Alcohol Use)
('AUDIT-C', 'Alcohol Use Disorders Identification Test - Consumption',
 'A 3-item alcohol screen to identify hazardous drinking or active alcohol use disorders.',
 '1.0', 'substance', 0, 12,
 '[
   {"min": 0, "max": 2, "severity": "low_risk", "label": "Low risk (women)", "gender": "F"},
   {"min": 0, "max": 3, "severity": "low_risk", "label": "Low risk (men)", "gender": "M"},
   {"min": 3, "max": 12, "severity": "at_risk", "label": "At-risk drinking (women)", "gender": "F"},
   {"min": 4, "max": 12, "severity": "at_risk", "label": "At-risk drinking (men)", "gender": "M"}
 ]'::JSONB,
 '[
   {"id": 1, "text": "How often do you have a drink containing alcohol?", "min": 0, "max": 4},
   {"id": 2, "text": "How many drinks containing alcohol do you have on a typical day when you are drinking?", "min": 0, "max": 4},
   {"id": 3, "text": "How often do you have six or more drinks on one occasion?", "min": 0, "max": 4}
 ]'::JSONB,
 '{"recommended_use": "Annual screening for alcohol misuse", "action_thresholds": {"men": 4, "women": 3}}'::JSONB,
 2, 'self-report', 'initial-only', TRUE, TRUE
),

-- Columbia Suicide Severity Rating Scale (C-SSRS) Screener
('C-SSRS', 'Columbia Suicide Severity Rating Scale - Screener',
 'A brief screening tool to identify individuals at risk for suicide.',
 '1.0', 'general', 0, 6,
 '[
   {"min": 0, "max": 0, "severity": "none", "label": "No identified risk"},
   {"min": 1, "max": 2, "severity": "low", "label": "Low risk - wish to be dead"},
   {"min": 3, "max": 4, "severity": "moderate", "label": "Moderate risk - suicidal thoughts"},
   {"min": 5, "max": 6, "severity": "high", "label": "High risk - suicidal intent/plan"}
 ]'::JSONB,
 '[
   {"id": 1, "text": "Have you wished you were dead or wished you could go to sleep and not wake up?", "type": "boolean"},
   {"id": 2, "text": "Have you actually had any thoughts of killing yourself?", "type": "boolean"},
   {"id": 3, "text": "Have you been thinking about how you might do this?", "type": "boolean"},
   {"id": 4, "text": "Have you had these thoughts and had some intention of acting on them?", "type": "boolean"},
   {"id": 5, "text": "Have you started to work out or worked out the details of how to kill yourself? Do you intend to carry out this plan?", "type": "boolean"},
   {"id": 6, "text": "Have you ever done anything, started to do anything, or prepared to do anything to end your life?", "type": "boolean"}
 ]'::JSONB,
 '{"recommended_use": "Risk assessment for suicidality", "critical_items": [3, 4, 5, 6], "note": "Positive responses require immediate clinical assessment"}'::JSONB,
 3, 'clinician-administered', 'every-visit', TRUE, TRUE
);

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE outcome_measure_definitions IS 'Extensible definitions for outcome measures (PHQ-9, GAD-7, PCL-5, AUDIT-C, custom)';
COMMENT ON COLUMN outcome_measure_definitions.score_interpretation IS 'JSONB array of score ranges with severity labels';
COMMENT ON COLUMN outcome_measure_definitions.items IS 'JSONB array of questions/items for self-report measures';
COMMENT ON COLUMN outcome_measures.item_responses IS 'JSONB array of individual item responses for detailed analysis';
COMMENT ON COLUMN outcome_measures.severity IS 'Calculated severity based on score and measure definition';
