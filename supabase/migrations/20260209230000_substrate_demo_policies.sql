-- ============================================================================
-- Migration: Substrate Demo Policies
-- Adds demo practice fallback policies for substrate tables
-- ============================================================================

-- Demo practice ID constant
-- 550e8400-e29b-41d4-a716-446655440000

-- ============================================
-- SUBSTRATE_ACTIONS TABLE - Add demo fallback
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view actions for their practice" ON substrate_actions;
DROP POLICY IF EXISTS "Users can update actions for their practice" ON substrate_actions;

-- Create new policies with demo fallback
CREATE POLICY substrate_actions_select ON substrate_actions
    FOR SELECT
    USING (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

CREATE POLICY substrate_actions_insert ON substrate_actions
    FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

CREATE POLICY substrate_actions_update ON substrate_actions
    FOR UPDATE
    USING (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

CREATE POLICY substrate_actions_delete ON substrate_actions
    FOR DELETE
    USING (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- SUBSTRATE_SCAN_LOG TABLE - Add demo fallback
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scans for their practice" ON substrate_scan_log;

-- Create new policies with demo fallback
CREATE POLICY substrate_scan_log_select ON substrate_scan_log
    FOR SELECT
    USING (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

CREATE POLICY substrate_scan_log_insert ON substrate_scan_log
    FOR INSERT
    WITH CHECK (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

CREATE POLICY substrate_scan_log_update ON substrate_scan_log
    FOR UPDATE
    USING (
        practice_id IN (
            SELECT practice_id FROM practice_users WHERE user_id = auth.uid()
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY substrate_actions_select ON substrate_actions IS 'Users can view substrate actions for their practice; demo practice has anonymous access';
COMMENT ON POLICY substrate_scan_log_select ON substrate_scan_log IS 'Users can view scan logs for their practice; demo practice has anonymous access';

DO $$
BEGIN
    RAISE NOTICE 'Substrate demo fallback policies applied successfully!';
END $$;
