-- Demo Fallback Policies
-- Created: 2026-02-09
-- Purpose: Allow anonymous access to demo practice for hackathon while maintaining RLS structure
-- This adds OR conditions for the demo practice ID to existing policies

-- Demo practice ID constant
-- 550e8400-e29b-41d4-a716-446655440000

-- ============================================
-- PATIENTS TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS patients_select ON patients;
CREATE POLICY patients_select ON patients
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS patients_insert ON patients;
CREATE POLICY patients_insert ON patients
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS patients_update ON patients;
CREATE POLICY patients_update ON patients
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS patients_delete ON patients;
CREATE POLICY patients_delete ON patients
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('owner')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- PRACTICES TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS practices_select ON practices;
CREATE POLICY practices_select ON practices
    FOR SELECT
    USING (
        id = public.practice_id()
        OR id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = practices.id
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- APPOINTMENTS TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS appointments_select ON appointments;
CREATE POLICY appointments_select ON appointments
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS appointments_insert ON appointments;
CREATE POLICY appointments_insert ON appointments
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS appointments_update ON appointments;
CREATE POLICY appointments_update ON appointments
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS appointments_delete ON appointments;
CREATE POLICY appointments_delete ON appointments
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- OUTCOME MEASURES TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS outcome_measures_select ON outcome_measures;
CREATE POLICY outcome_measures_select ON outcome_measures
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS outcome_measures_insert ON outcome_measures;
CREATE POLICY outcome_measures_insert ON outcome_measures
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS outcome_measures_update ON outcome_measures;
CREATE POLICY outcome_measures_update ON outcome_measures
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS outcome_measures_delete ON outcome_measures;
CREATE POLICY outcome_measures_delete ON outcome_measures
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- MESSAGES TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS messages_update ON messages;
CREATE POLICY messages_update ON messages
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS messages_delete ON messages;
CREATE POLICY messages_delete ON messages
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- INVOICES TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS invoices_select ON invoices;
CREATE POLICY invoices_select ON invoices
    FOR SELECT
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('billing')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS invoices_insert ON invoices;
CREATE POLICY invoices_insert ON invoices
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('billing')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS invoices_update ON invoices;
CREATE POLICY invoices_update ON invoices
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('billing')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS invoices_delete ON invoices;
CREATE POLICY invoices_delete ON invoices
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- PRIORITY ACTIONS TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS priority_actions_select ON priority_actions;
CREATE POLICY priority_actions_select ON priority_actions
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS priority_actions_insert ON priority_actions;
CREATE POLICY priority_actions_insert ON priority_actions
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS priority_actions_update ON priority_actions;
CREATE POLICY priority_actions_update ON priority_actions
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS priority_actions_delete ON priority_actions;
CREATE POLICY priority_actions_delete ON priority_actions
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- CLINICAL TASKS TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS clinical_tasks_select ON clinical_tasks;
CREATE POLICY clinical_tasks_select ON clinical_tasks
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS clinical_tasks_insert ON clinical_tasks;
CREATE POLICY clinical_tasks_insert ON clinical_tasks
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS clinical_tasks_update ON clinical_tasks;
CREATE POLICY clinical_tasks_update ON clinical_tasks
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS clinical_tasks_delete ON clinical_tasks;
CREATE POLICY clinical_tasks_delete ON clinical_tasks
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- AI ANALYSIS RUNS TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS ai_runs_select ON ai_analysis_runs;
CREATE POLICY ai_runs_select ON ai_analysis_runs
    FOR SELECT
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- COMMUNICATIONS TABLE - Add demo fallback
-- ============================================
DROP POLICY IF EXISTS communications_select ON communications;
CREATE POLICY communications_select ON communications
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS communications_insert ON communications;
CREATE POLICY communications_insert ON communications
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS communications_update ON communications;
CREATE POLICY communications_update ON communications
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

DROP POLICY IF EXISTS communications_delete ON communications;
CREATE POLICY communications_delete ON communications
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid  -- Demo practice fallback
        OR auth.role() = 'service_role'
    );

-- ============================================
-- PRIORITIZED_ACTIONS VIEW/TABLE - Add demo fallback (if exists)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prioritized_actions') THEN
        EXECUTE 'DROP POLICY IF EXISTS prioritized_actions_select ON prioritized_actions';
        EXECUTE 'CREATE POLICY prioritized_actions_select ON prioritized_actions
            FOR SELECT
            USING (
                practice_id = public.practice_id()
                OR practice_id = ''550e8400-e29b-41d4-a716-446655440000''::uuid
                OR auth.role() = ''service_role''
            )';
    END IF;
END $$;

-- ============================================
-- COMMENT
-- ============================================
COMMENT ON POLICY patients_select ON patients IS 'All practice members can view patients; demo practice has anonymous access';
COMMENT ON POLICY appointments_select ON appointments IS 'All practice members can view appointments; demo practice has anonymous access';
COMMENT ON POLICY messages_select ON messages IS 'All practice members can view messages; demo practice has anonymous access';

DO $$
BEGIN
    RAISE NOTICE 'Demo fallback policies applied successfully!';
    RAISE NOTICE 'Anonymous users can now access demo practice: 550e8400-e29b-41d4-a716-446655440000';
END $$;
