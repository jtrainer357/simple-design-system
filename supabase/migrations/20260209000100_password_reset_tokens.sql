-- Migration: Password Reset Tokens Table
-- Agent: ALPHA (Auth & Onboarding)
-- Created: 2026-02-09
-- Note: Table already created in 20260207000001_users_roles.sql with token_hash column

-- Just add any additional comments (table already exists)
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens with expiry. Tokens are single-use and expire after 1 hour.';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'Hashed version of the secure random token sent via email';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiry time (default 1 hour from creation)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used (NULL if unused)';
