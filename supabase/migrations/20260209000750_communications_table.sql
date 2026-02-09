-- Migration 750: Communications Table
-- Created: 2026-02-08
-- Purpose: Create communications table for patient messaging

-- ============================================
-- COMMUNICATIONS TABLE
-- ============================================
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- Channel and direction
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'portal', 'voice')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  -- Sender/recipient info
  sender TEXT,
  recipient TEXT,
  sender_email TEXT,
  recipient_email TEXT,
  sender_phone TEXT,
  recipient_phone TEXT,
  -- Message content
  message_body TEXT,
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_communications_practice_id ON communications(practice_id);
CREATE INDEX idx_communications_patient_id ON communications(patient_id);
CREATE INDEX idx_communications_sent_at ON communications(sent_at DESC);
CREATE INDEX idx_communications_unread ON communications(practice_id, direction, is_read) WHERE is_read = FALSE;

-- Enable RLS
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (authenticated users)
CREATE POLICY communications_select ON communications
    FOR SELECT
    USING (
        practice_id IN (
            SELECT practice_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY communications_insert ON communications
    FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT practice_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY communications_update ON communications
    FOR UPDATE
    USING (
        practice_id IN (
            SELECT practice_id FROM users WHERE id = auth.uid()
        )
    );

-- Comments
COMMENT ON TABLE communications IS 'Patient communications including SMS, email, and portal messages';
COMMENT ON COLUMN communications.channel IS 'Communication channel: sms, email, portal, or voice';
COMMENT ON COLUMN communications.direction IS 'Message direction: inbound (from patient) or outbound (to patient)';
