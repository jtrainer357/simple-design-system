-- Migration: Password Reset Tokens Table
-- Agent: ALPHA (Auth & Onboarding)
-- Created: 2026-02-09

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT token_not_empty CHECK (token != ''),
  CONSTRAINT expires_after_created CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at) WHERE used_at IS NULL;

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password_reset_tokens_service_only" ON password_reset_tokens FOR ALL USING (false);

COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens with expiry. Tokens are single-use and expire after 1 hour.';
COMMENT ON COLUMN password_reset_tokens.token IS 'Secure random 64-character hex token sent via email';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiry time (default 1 hour from creation)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used (NULL if unused)';
