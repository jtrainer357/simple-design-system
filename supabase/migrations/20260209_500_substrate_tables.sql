-- ============================================================================
-- Migration: Substrate Intelligence Layer Tables
-- Number: 500
-- Agent: EPSILON
-- Description: Creates tables for the substrate intelligence layer including
--              priority actions and scan logging.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SUBSTRATE ACTIONS TABLE
-- Stores AI-generated priority actions for practices
-- ============================================================================

CREATE TABLE IF NOT EXISTS substrate_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

  -- Action content
  trigger_type TEXT NOT NULL,
  title TEXT NOT NULL,
  context TEXT NOT NULL,
  urgency TEXT NOT NULL CHECK (urgency IN ('urgent', 'high', 'medium', 'low')),
  time_frame TEXT NOT NULL,

  -- AI metadata
  ai_confidence INTEGER NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  ai_reasoning TEXT,
  suggested_actions JSONB DEFAULT '[]'::jsonb,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dismissed', 'snoozed')),
  snoozed_until TIMESTAMPTZ,
  dismissed_reason TEXT,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Prevent duplicates for same trigger
  CONSTRAINT unique_action_trigger UNIQUE (practice_id, patient_id, trigger_type, DATE(created_at))
);

-- Indexes for efficient querying
CREATE INDEX idx_substrate_actions_practice ON substrate_actions(practice_id);
CREATE INDEX idx_substrate_actions_patient ON substrate_actions(patient_id);
CREATE INDEX idx_substrate_actions_status ON substrate_actions(status);
CREATE INDEX idx_substrate_actions_urgency ON substrate_actions(urgency);
CREATE INDEX idx_substrate_actions_created ON substrate_actions(created_at DESC);
CREATE INDEX idx_substrate_actions_active ON substrate_actions(practice_id, status)
  WHERE status = 'active';

-- Enable RLS
ALTER TABLE substrate_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view actions for their practice"
  ON substrate_actions FOR SELECT
  USING (
    practice_id IN (
      SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update actions for their practice"
  ON substrate_actions FOR UPDATE
  USING (
    practice_id IN (
      SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- SUBSTRATE SCAN LOG TABLE
-- Logs substrate scan runs for monitoring and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS substrate_scan_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,

  -- Scan metadata
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'completed_with_errors', 'failed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Results
  triggers_detected INTEGER DEFAULT 0,
  actions_generated INTEGER DEFAULT 0,
  errors JSONB,

  -- Who triggered it
  triggered_by TEXT DEFAULT 'system' CHECK (triggered_by IN ('system', 'manual', 'scheduled'))
);

-- Indexes
CREATE INDEX idx_substrate_scan_log_practice ON substrate_scan_log(practice_id);
CREATE INDEX idx_substrate_scan_log_started ON substrate_scan_log(started_at DESC);
CREATE INDEX idx_substrate_scan_log_status ON substrate_scan_log(status);

-- Enable RLS
ALTER TABLE substrate_scan_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view scans for their practice"
  ON substrate_scan_log FOR SELECT
  USING (
    practice_id IN (
      SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_substrate_action_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_substrate_action_updated_at
  BEFORE UPDATE ON substrate_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_substrate_action_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE substrate_actions IS 'AI-generated priority action cards for clinical decision support';
COMMENT ON TABLE substrate_scan_log IS 'Log of substrate scan runs for monitoring';

COMMENT ON COLUMN substrate_actions.trigger_type IS 'Type of clinical trigger that generated this action';
COMMENT ON COLUMN substrate_actions.ai_confidence IS 'AI confidence score 0-100';
COMMENT ON COLUMN substrate_actions.suggested_actions IS 'JSON array of suggested actions with type, label, and params';
