-- Mental Health MVP - Real Row Level Security Policies
-- Created: 2026-02-07
-- This migration replaces the demo USING(true) policies with real tenant isolation

-- ============================================
-- DROP DEMO POLICIES
-- ============================================
-- Remove the permissive demo policies
DROP POLICY IF EXISTS "demo_practices_all" ON practices;
DROP POLICY IF EXISTS "demo_patients_all" ON patients;
DROP POLICY IF EXISTS "demo_appointments_all" ON appointments;
DROP POLICY IF EXISTS "demo_outcome_measures_all" ON outcome_measures;
DROP POLICY IF EXISTS "demo_messages_all" ON messages;
DROP POLICY IF EXISTS "demo_invoices_all" ON invoices;
DROP POLICY IF EXISTS "demo_priority_actions_all" ON priority_actions;
DROP POLICY IF EXISTS "demo_clinical_tasks_all" ON clinical_tasks;
DROP POLICY IF EXISTS "demo_ai_runs_all" ON ai_analysis_runs;

-- ============================================
-- HELPER: Get user's practice from JWT
-- ============================================
-- This function extracts the practice_id from the JWT claims
-- Already created in 20260207_001_users_roles.sql

-- ============================================
-- PRACTICES TABLE POLICIES
-- ============================================

-- Users can view practices they belong to
CREATE POLICY practices_select ON practices
    FOR SELECT
    USING (
        id = public.practice_id()
        OR EXISTS (
            SELECT 1 FROM practice_users pu
            WHERE pu.user_id = auth.uid()
            AND pu.practice_id = practices.id
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Only owners can update practice settings
CREATE POLICY practices_update ON practices
    FOR UPDATE
    USING (
        (
            id = public.practice_id()
            AND public.has_role('owner')
        )
        OR auth.role() = 'service_role'
    );

-- Service role only for insert/delete (admin operations)
CREATE POLICY practices_insert ON practices
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY practices_delete ON practices
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ============================================
-- PATIENTS TABLE POLICIES
-- ============================================

-- View patients in user's practice (all roles can view)
CREATE POLICY patients_select ON patients
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR auth.role() = 'service_role'
    );

-- Insert patients (providers, admins, owners)
CREATE POLICY patients_insert ON patients
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR auth.role() = 'service_role'
    );

-- Update patients (providers, admins, owners)
CREATE POLICY patients_update ON patients
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR auth.role() = 'service_role'
    );

-- Delete patients (only owners)
CREATE POLICY patients_delete ON patients
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('owner')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- APPOINTMENTS TABLE POLICIES
-- ============================================

-- View appointments in user's practice
CREATE POLICY appointments_select ON appointments
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR auth.role() = 'service_role'
    );

-- Staff and above can create appointments
CREATE POLICY appointments_insert ON appointments
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Staff and above can update appointments
CREATE POLICY appointments_update ON appointments
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can delete appointments
CREATE POLICY appointments_delete ON appointments
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- OUTCOME MEASURES TABLE POLICIES
-- ============================================

-- View outcome measures in user's practice
CREATE POLICY outcome_measures_select ON outcome_measures
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR auth.role() = 'service_role'
    );

-- Providers and above can create outcome measures
CREATE POLICY outcome_measures_insert ON outcome_measures
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR auth.role() = 'service_role'
    );

-- Providers and above can update outcome measures
CREATE POLICY outcome_measures_update ON outcome_measures
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can delete outcome measures
CREATE POLICY outcome_measures_delete ON outcome_measures
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- MESSAGES TABLE POLICIES
-- ============================================

-- View messages in user's practice
CREATE POLICY messages_select ON messages
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR auth.role() = 'service_role'
    );

-- Staff and above can create messages
CREATE POLICY messages_insert ON messages
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Staff and above can update messages (mark as read, etc.)
CREATE POLICY messages_update ON messages
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins can delete messages
CREATE POLICY messages_delete ON messages
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- INVOICES TABLE POLICIES
-- ============================================

-- Billing role and above can view invoices
CREATE POLICY invoices_select ON invoices
    FOR SELECT
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('billing')
        )
        OR auth.role() = 'service_role'
    );

-- Billing role and above can create invoices
CREATE POLICY invoices_insert ON invoices
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('billing')
        )
        OR auth.role() = 'service_role'
    );

-- Billing role and above can update invoices
CREATE POLICY invoices_update ON invoices
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('billing')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can delete invoices
CREATE POLICY invoices_delete ON invoices
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- PRIORITY ACTIONS TABLE POLICIES
-- ============================================

-- View priority actions in user's practice
CREATE POLICY priority_actions_select ON priority_actions
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR auth.role() = 'service_role'
    );

-- Providers and above can create priority actions
CREATE POLICY priority_actions_insert ON priority_actions
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR auth.role() = 'service_role'
    );

-- Staff and above can update priority actions (mark complete, etc.)
CREATE POLICY priority_actions_update ON priority_actions
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins can delete priority actions
CREATE POLICY priority_actions_delete ON priority_actions
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- CLINICAL TASKS TABLE POLICIES
-- ============================================

-- View clinical tasks in user's practice
CREATE POLICY clinical_tasks_select ON clinical_tasks
    FOR SELECT
    USING (
        practice_id = public.practice_id()
        OR auth.role() = 'service_role'
    );

-- Staff and above can create clinical tasks
CREATE POLICY clinical_tasks_insert ON clinical_tasks
    FOR INSERT
    WITH CHECK (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Staff and above can update clinical tasks
CREATE POLICY clinical_tasks_update ON clinical_tasks
    FOR UPDATE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('staff')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins can delete clinical tasks
CREATE POLICY clinical_tasks_delete ON clinical_tasks
    FOR DELETE
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('admin')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- AI ANALYSIS RUNS TABLE POLICIES
-- ============================================

-- View AI runs in user's practice (providers and above)
CREATE POLICY ai_runs_select ON ai_analysis_runs
    FOR SELECT
    USING (
        (
            practice_id = public.practice_id()
            AND public.has_role('provider')
        )
        OR auth.role() = 'service_role'
    );

-- Only service role can insert AI runs (automated process)
CREATE POLICY ai_runs_insert ON ai_analysis_runs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- Only service role can update/delete AI runs
CREATE POLICY ai_runs_update ON ai_analysis_runs
    FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY ai_runs_delete ON ai_analysis_runs
    FOR DELETE
    USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY practices_select ON practices IS 'Users can view practices they belong to';
COMMENT ON POLICY practices_update ON practices IS 'Only practice owners can update settings';

COMMENT ON POLICY patients_select ON patients IS 'All practice members can view patients';
COMMENT ON POLICY patients_insert ON patients IS 'Providers and above can create patients';
COMMENT ON POLICY patients_update ON patients IS 'Providers and above can update patients';
COMMENT ON POLICY patients_delete ON patients IS 'Only owners can delete patients';

COMMENT ON POLICY appointments_select ON appointments IS 'All practice members can view appointments';
COMMENT ON POLICY appointments_insert ON appointments IS 'Staff and above can create appointments';
COMMENT ON POLICY appointments_update ON appointments IS 'Staff and above can update appointments';
COMMENT ON POLICY appointments_delete ON appointments IS 'Admins and above can delete appointments';

COMMENT ON POLICY invoices_select ON invoices IS 'Billing role and above can view invoices';
COMMENT ON POLICY invoices_insert ON invoices IS 'Billing role and above can create invoices';
COMMENT ON POLICY invoices_update ON invoices IS 'Billing role and above can update invoices';
COMMENT ON POLICY invoices_delete ON invoices IS 'Admins and above can delete invoices';
