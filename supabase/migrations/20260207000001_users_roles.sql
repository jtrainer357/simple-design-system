-- Mental Health MVP - Users and Roles Schema
-- Created: 2026-02-07
-- This migration creates the authentication and authorization tables

-- ============================================
-- USER ROLE ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'owner',
        'admin',
        'provider',
        'staff',
        'billing',
        'readonly'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Authentication
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    -- Profile
    name TEXT NOT NULL,
    avatar_url TEXT,
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    email_verified_at TIMESTAMPTZ,
    -- Security
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    mfa_secret TEXT,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    -- Preferences
    timezone TEXT DEFAULT 'America/Los_Angeles',
    -- Audit
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRACTICE_USERS (User-Practice Membership)
-- ============================================
-- This table links users to practices with their roles
-- A user can belong to multiple practices with different roles
CREATE TABLE IF NOT EXISTS practice_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- References
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    -- Role within this practice
    role user_role NOT NULL DEFAULT 'staff',
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    -- Invitation tracking
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraints
    UNIQUE(user_id, practice_id)
);

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER INVITATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Invitation details
    email TEXT NOT NULL,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'staff',
    -- Token for verification
    token_hash TEXT NOT NULL UNIQUE,
    -- Tracking
    invited_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Constraints
    UNIQUE(email, practice_id)
);

-- ============================================
-- SESSIONS (for server-side session storage if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
    -- Session token (hashed)
    session_token_hash TEXT NOT NULL UNIQUE,
    -- Expiration
    expires_at TIMESTAMPTZ NOT NULL,
    -- Device info for security
    user_agent TEXT,
    ip_address TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = true;

-- Practice Users
CREATE INDEX IF NOT EXISTS idx_practice_users_user ON practice_users(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_users_practice ON practice_users(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_users_active ON practice_users(user_id, is_active) WHERE is_active = true;

-- Password Reset Tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at) WHERE used_at IS NULL;

-- User Invitations
CREATE INDEX IF NOT EXISTS idx_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_practice ON user_invitations(practice_id);
CREATE INDEX IF NOT EXISTS idx_invitations_expires ON user_invitations(expires_at) WHERE accepted_at IS NULL;

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token_hash);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all auth tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see themselves (service role bypasses RLS)
CREATE POLICY users_self_select ON users
    FOR SELECT
    USING (id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY users_self_update ON users
    FOR UPDATE
    USING (id = auth.uid() OR auth.role() = 'service_role');

-- Practice users - users can see members of their practices
CREATE POLICY practice_users_select ON practice_users
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid() AND is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can insert/update/delete practice users
CREATE POLICY practice_users_insert ON practice_users
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = practice_users.practice_id
            AND pu.role IN ('owner', 'admin')
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY practice_users_update ON practice_users
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = practice_users.practice_id
            AND pu.role IN ('owner', 'admin')
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY practice_users_delete ON practice_users
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = practice_users.practice_id
            AND pu.role = 'owner'
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Password reset tokens - only service role
CREATE POLICY password_reset_service ON password_reset_tokens
    FOR ALL
    USING (auth.role() = 'service_role');

-- Invitations - admins/owners of practice
CREATE POLICY invitations_select ON user_invitations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = user_invitations.practice_id
            AND pu.role IN ('owner', 'admin')
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

CREATE POLICY invitations_insert ON user_invitations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = user_invitations.practice_id
            AND pu.role IN ('owner', 'admin')
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Sessions - users can only see their own
CREATE POLICY sessions_self ON sessions
    FOR ALL
    USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_users_updated_at
    BEFORE UPDATE ON practice_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's current practice ID from JWT
CREATE OR REPLACE FUNCTION public.practice_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'practiceId', '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's role in current practice from JWT
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
BEGIN
    RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::user_role;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has at least a certain role
CREATE OR REPLACE FUNCTION public.has_role(required_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_role user_role;
    role_order INTEGER[];
BEGIN
    v_current_role := public.user_role();
    IF v_current_role IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Role hierarchy: readonly < staff < billing < provider < admin < owner
    role_order := ARRAY[
        CASE v_current_role
            WHEN 'readonly' THEN 1
            WHEN 'staff' THEN 2
            WHEN 'billing' THEN 3
            WHEN 'provider' THEN 4
            WHEN 'admin' THEN 5
            WHEN 'owner' THEN 6
        END,
        CASE required_role
            WHEN 'readonly' THEN 1
            WHEN 'staff' THEN 2
            WHEN 'billing' THEN 3
            WHEN 'provider' THEN 4
            WHEN 'admin' THEN 5
            WHEN 'owner' THEN 6
        END
    ];

    RETURN role_order[1] >= role_order[2];
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.practice_id() IS 'Returns the practice_id from the current JWT claims';
COMMENT ON FUNCTION public.user_role() IS 'Returns the user role from the current JWT claims';
COMMENT ON FUNCTION public.has_role(user_role) IS 'Checks if user has at least the specified role';
