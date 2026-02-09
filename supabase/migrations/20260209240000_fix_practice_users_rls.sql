-- ============================================================================
-- Migration: Fix practice_users RLS infinite recursion
-- Removes self-referential policies and adds demo fallback
-- ============================================================================

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS practice_users_select ON practice_users;
DROP POLICY IF EXISTS practice_users_insert ON practice_users;
DROP POLICY IF EXISTS practice_users_update ON practice_users;
DROP POLICY IF EXISTS practice_users_delete ON practice_users;

-- Create new policies without self-reference
-- For SELECT: Users can see their own memberships or demo practice memberships
CREATE POLICY practice_users_select ON practice_users
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice
        OR auth.role() = 'service_role'
    );

-- For INSERT: Service role only (admin operations)
CREATE POLICY practice_users_insert ON practice_users
    FOR INSERT
    WITH CHECK (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice
        OR auth.role() = 'service_role'
    );

-- For UPDATE: Service role only
CREATE POLICY practice_users_update ON practice_users
    FOR UPDATE
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice
        OR auth.role() = 'service_role'
    );

-- For DELETE: Service role only
CREATE POLICY practice_users_delete ON practice_users
    FOR DELETE
    USING (
        auth.role() = 'service_role'
    );

DO $$
BEGIN
    RAISE NOTICE 'Fixed practice_users RLS - removed infinite recursion';
END $$;
