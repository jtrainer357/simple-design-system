-- Mental Health MVP - Audit Log for HIPAA Compliance
-- Created: 2026-02-07
-- This migration creates a comprehensive audit logging system

-- ============================================
-- AUDIT ACTION ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'view',
        'create',
        'update',
        'delete',
        'export',
        'search',
        'login',
        'logout',
        'login_failed',
        'password_change',
        'mfa_enable',
        'mfa_disable',
        'role_change',
        'access_denied'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- AUDIT RESOURCE TYPE ENUM
-- ============================================
DO $$ BEGIN
    CREATE TYPE audit_resource_type AS ENUM (
        'patient',
        'session_note',
        'appointment',
        'outcome_measure',
        'message',
        'invoice',
        'priority_action',
        'clinical_task',
        'user',
        'practice',
        'import_batch',
        'export',
        'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
-- This table stores immutable audit records for HIPAA compliance
-- Records should NEVER be deleted (only archived if needed)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Timing
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Actor information
    user_id UUID REFERENCES users(id),
    user_email TEXT, -- Denormalized for historical accuracy
    user_name TEXT,  -- Denormalized for historical accuracy
    -- Context
    practice_id UUID REFERENCES practices(id),
    practice_name TEXT, -- Denormalized for historical accuracy
    -- Action details
    action audit_action NOT NULL,
    resource_type audit_resource_type NOT NULL,
    resource_id TEXT, -- ID of the affected resource
    -- Additional context
    details JSONB DEFAULT '{}',
    -- Change tracking (for updates)
    old_values JSONB, -- Previous state (for updates/deletes)
    new_values JSONB, -- New state (for creates/updates)
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_id TEXT, -- Correlation ID for request tracing
    -- Severity/compliance flags
    is_phi_access BOOLEAN NOT NULL DEFAULT false, -- Did this access PHI?
    is_sensitive BOOLEAN NOT NULL DEFAULT false,  -- Is this a sensitive action?
    -- Partitioning (for large tables)
    created_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ============================================
-- PARTITION BY DATE (for performance)
-- ============================================
-- Note: In production, you'd use table partitioning
-- For the hackathon, we'll use a date column for filtering

-- ============================================
-- INDEXES
-- ============================================

-- Primary lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_practice ON audit_logs(practice_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Compliance queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_phi ON audit_logs(is_phi_access, timestamp DESC) WHERE is_phi_access = true;
CREATE INDEX IF NOT EXISTS idx_audit_logs_sensitive ON audit_logs(is_sensitive, timestamp DESC) WHERE is_sensitive = true;

-- Date-based partitioning helper
CREATE INDEX IF NOT EXISTS idx_audit_logs_date ON audit_logs(created_date, timestamp DESC);

-- Combined for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_practice_resource ON audit_logs(practice_id, resource_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_resource ON audit_logs(user_id, resource_type, timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs are immutable - only service role can insert
CREATE POLICY audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Admins and owners can view their practice's audit logs
CREATE POLICY audit_logs_select ON audit_logs
    FOR SELECT
    USING (
        (
            practice_id = auth.practice_id()
            AND auth.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- No updates or deletes allowed (audit logs are immutable)
CREATE POLICY audit_logs_update ON audit_logs
    FOR UPDATE
    USING (false); -- Never allow updates

CREATE POLICY audit_logs_delete ON audit_logs
    FOR DELETE
    USING (false); -- Never allow deletes

-- ============================================
-- HELPER FUNCTION: Log audit event
-- ============================================
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action audit_action,
    p_resource_type audit_resource_type,
    p_resource_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_is_phi_access BOOLEAN DEFAULT false,
    p_is_sensitive BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_user_name TEXT;
    v_practice_id UUID;
    v_practice_name TEXT;
    v_audit_id UUID;
BEGIN
    -- Get current user info from JWT
    v_user_id := auth.uid();
    v_practice_id := auth.practice_id();

    -- Look up user and practice names for denormalization
    IF v_user_id IS NOT NULL THEN
        SELECT email, name INTO v_user_email, v_user_name
        FROM users WHERE id = v_user_id;
    END IF;

    IF v_practice_id IS NOT NULL THEN
        SELECT name INTO v_practice_name
        FROM practices WHERE id = v_practice_id;
    END IF;

    -- Insert audit record
    INSERT INTO audit_logs (
        user_id,
        user_email,
        user_name,
        practice_id,
        practice_name,
        action,
        resource_type,
        resource_id,
        details,
        old_values,
        new_values,
        is_phi_access,
        is_sensitive
    ) VALUES (
        v_user_id,
        v_user_email,
        v_user_name,
        v_practice_id,
        v_practice_name,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_old_values,
        p_new_values,
        p_is_phi_access,
        p_is_sensitive
    )
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC AUDITING
-- ============================================

-- Generic audit trigger for tables
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_action audit_action;
    v_resource_type audit_resource_type;
    v_resource_id TEXT;
    v_old_values JSONB;
    v_new_values JSONB;
    v_is_phi BOOLEAN := false;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        v_action := 'create';
        v_new_values := to_jsonb(NEW);
        v_resource_id := NEW.id::TEXT;
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'update';
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
        v_resource_id := NEW.id::TEXT;
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'delete';
        v_old_values := to_jsonb(OLD);
        v_resource_id := OLD.id::TEXT;
    END IF;

    -- Determine resource type from table name
    v_resource_type := TG_TABLE_NAME::audit_resource_type;

    -- Mark PHI access for clinical tables
    IF TG_TABLE_NAME IN ('patients', 'outcome_measures', 'messages', 'appointments') THEN
        v_is_phi := true;
    END IF;

    -- Log the event
    PERFORM log_audit_event(
        v_action,
        v_resource_type,
        v_resource_id,
        jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP),
        v_old_values,
        v_new_values,
        v_is_phi,
        false
    );

    -- Return appropriate value
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- APPLY AUDIT TRIGGERS TO TABLES
-- ============================================
-- Note: These are commented out for the hackathon demo
-- to avoid performance overhead. Enable in production.

-- CREATE TRIGGER audit_patients
--     AFTER INSERT OR UPDATE OR DELETE ON patients
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- CREATE TRIGGER audit_appointments
--     AFTER INSERT OR UPDATE OR DELETE ON appointments
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- CREATE TRIGGER audit_outcome_measures
--     AFTER INSERT OR UPDATE OR DELETE ON outcome_measures
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- CREATE TRIGGER audit_messages
--     AFTER INSERT OR UPDATE OR DELETE ON messages
--     FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- AUDIT LOG RETENTION POLICY
-- ============================================
-- HIPAA requires audit logs to be retained for 6 years
-- This function can be scheduled to archive old logs

CREATE OR REPLACE FUNCTION archive_old_audit_logs(retention_years INTEGER DEFAULT 6)
RETURNS INTEGER AS $$
DECLARE
    cutoff_date DATE;
    archived_count INTEGER;
BEGIN
    cutoff_date := CURRENT_DATE - (retention_years || ' years')::INTERVAL;

    -- In production, this would move logs to cold storage
    -- For now, we just count how many would be archived
    SELECT COUNT(*) INTO archived_count
    FROM audit_logs
    WHERE created_date < cutoff_date;

    -- Log the archival action
    PERFORM log_audit_event(
        'export'::audit_action,
        'system'::audit_resource_type,
        NULL,
        jsonb_build_object(
            'operation', 'audit_log_archive',
            'cutoff_date', cutoff_date,
            'records_archived', archived_count
        ),
        NULL,
        NULL,
        false,
        true
    );

    RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS FOR COMMON AUDIT QUERIES
-- ============================================

-- Recent PHI access view
CREATE OR REPLACE VIEW v_recent_phi_access AS
SELECT
    timestamp,
    user_email,
    user_name,
    practice_name,
    action,
    resource_type,
    resource_id,
    details
FROM audit_logs
WHERE is_phi_access = true
AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- Failed login attempts view
CREATE OR REPLACE VIEW v_failed_logins AS
SELECT
    timestamp,
    details->>'email' as attempted_email,
    ip_address,
    user_agent
FROM audit_logs
WHERE action = 'login_failed'
AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- User activity summary view
CREATE OR REPLACE VIEW v_user_activity_summary AS
SELECT
    user_id,
    user_email,
    user_name,
    practice_name,
    action,
    resource_type,
    COUNT(*) as event_count,
    MAX(timestamp) as last_event
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY user_id, user_email, user_name, practice_name, action, resource_type
ORDER BY last_event DESC;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE audit_logs IS 'Immutable audit log for HIPAA compliance. Records all data access and modifications.';
COMMENT ON COLUMN audit_logs.is_phi_access IS 'Flag indicating if this action accessed Protected Health Information';
COMMENT ON COLUMN audit_logs.is_sensitive IS 'Flag indicating if this is a sensitive security action';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous state of record (for updates/deletes)';
COMMENT ON COLUMN audit_logs.new_values IS 'New state of record (for creates/updates)';

COMMENT ON FUNCTION log_audit_event IS 'Helper function to log audit events with proper context';
COMMENT ON FUNCTION archive_old_audit_logs IS 'Archive audit logs older than retention period (default 6 years for HIPAA)';
