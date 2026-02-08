-- Migration 700: RLS Hardening for Clinical Documentation Tables
-- Created: 2026-02-08
-- Purpose: Replace demo policies with proper practice-level isolation
-- This migration hardens the RLS policies created in migration 400

-- ============================================
-- DROP DEMO POLICIES
-- ============================================
DROP POLICY IF EXISTS "demo_patient_diagnoses_all" ON patient_diagnoses;
DROP POLICY IF EXISTS "demo_patient_medications_all" ON patient_medications;
DROP POLICY IF EXISTS "demo_outcome_measure_scores_all" ON outcome_measure_scores;

-- ============================================
-- PATIENT DIAGNOSES - Practice-Level RLS
-- ============================================

-- Users can view diagnoses for patients in their practice
CREATE POLICY patient_diagnoses_select ON patient_diagnoses
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_diagnoses.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Providers can insert diagnoses for patients in their practice
CREATE POLICY patient_diagnoses_insert ON patient_diagnoses
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('provider', 'admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- Providers can update diagnoses for patients in their practice
CREATE POLICY patient_diagnoses_update ON patient_diagnoses
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_diagnoses.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('provider', 'admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can delete diagnoses
CREATE POLICY patient_diagnoses_delete ON patient_diagnoses
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_diagnoses.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- PATIENT MEDICATIONS - Practice-Level RLS
-- ============================================

-- Users can view medications for patients in their practice
CREATE POLICY patient_medications_select ON patient_medications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_medications.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Providers can insert medications for patients in their practice
CREATE POLICY patient_medications_insert ON patient_medications
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('provider', 'admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- Providers can update medications for patients in their practice
CREATE POLICY patient_medications_update ON patient_medications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_medications.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('provider', 'admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can delete medications
CREATE POLICY patient_medications_delete ON patient_medications
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_medications.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- OUTCOME MEASURE SCORES - Practice-Level RLS
-- ============================================

-- Users can view scores for patients in their practice
CREATE POLICY outcome_measure_scores_select ON outcome_measure_scores
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = outcome_measure_scores.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Providers can insert scores for patients in their practice
CREATE POLICY outcome_measure_scores_insert ON outcome_measure_scores
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('provider', 'admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- Providers can update scores for patients in their practice
CREATE POLICY outcome_measure_scores_update ON outcome_measure_scores
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = outcome_measure_scores.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('provider', 'admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- Only admins/owners can delete scores (clinical data should not be deleted lightly)
CREATE POLICY outcome_measure_scores_delete ON outcome_measure_scores
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = outcome_measure_scores.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
            AND pu.role IN ('admin', 'owner')
        )
        OR auth.role() = 'service_role'
    );

-- ============================================
-- SESSION NOTES - Enhanced Practice-Level RLS
-- ============================================
-- The existing policies are too restrictive (provider can only see their own notes)
-- For a practice, all providers should be able to view notes for care coordination

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own session notes" ON session_notes;
DROP POLICY IF EXISTS "Users can insert their own session notes" ON session_notes;
DROP POLICY IF EXISTS "Users can update their own draft notes" ON session_notes;

-- Practice-level view access (all practice members can view all session notes)
CREATE POLICY session_notes_select ON session_notes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = session_notes.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Providers can insert notes for patients in their practice
CREATE POLICY session_notes_insert ON session_notes
    FOR INSERT
    WITH CHECK (
        (
            provider_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM patients p
                JOIN practice_users pu ON p.practice_id = pu.practice_id
                WHERE p.id = patient_id
                AND pu.user_id = auth.uid()
                AND pu.is_active = true
                AND pu.role IN ('provider', 'admin', 'owner')
            )
        )
        OR auth.role() = 'service_role'
    );

-- Providers can only update their OWN draft notes
CREATE POLICY session_notes_update ON session_notes
    FOR UPDATE
    USING (
        (
            provider_id = auth.uid()
            AND status = 'draft'
        )
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        (
            provider_id = auth.uid()
            AND status = 'draft'
        )
        OR auth.role() = 'service_role'
    );

-- No delete policy - session notes should not be deleted (use soft delete via status)

-- ============================================
-- SESSION ADDENDUMS - Enhanced Practice-Level RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view addendums for their notes" ON session_addendums;
DROP POLICY IF EXISTS "Users can add addendums to their signed notes" ON session_addendums;

-- All practice members can view addendums
CREATE POLICY session_addendums_select ON session_addendums
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM session_notes sn
            JOIN patients p ON sn.patient_id = p.id
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE sn.id = session_addendums.session_note_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Providers can add addendums to their own signed notes
CREATE POLICY session_addendums_insert ON session_addendums
    FOR INSERT
    WITH CHECK (
        (
            author_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM session_notes sn
                WHERE sn.id = session_note_id
                AND sn.provider_id = auth.uid()
                AND sn.status = 'signed'
            )
        )
        OR auth.role() = 'service_role'
    );

-- Addendums are immutable - no updates allowed
-- (handled by not having an UPDATE policy)

-- ============================================
-- SIGNED NOTE EVENTS - Enhanced Practice-Level RLS
-- ============================================

DROP POLICY IF EXISTS "Users can view their own signed note events" ON signed_note_events;

-- All practice members can view signed note events
CREATE POLICY signed_note_events_select ON signed_note_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            JOIN practice_users pu ON p.practice_id = pu.practice_id
            WHERE p.id = signed_note_events.patient_id
            AND pu.user_id = auth.uid()
            AND pu.is_active = true
        )
        OR auth.role() = 'service_role'
    );

-- Only service role can insert (triggered by session_notes signing)
CREATE POLICY signed_note_events_insert ON signed_note_events
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY patient_diagnoses_select ON patient_diagnoses IS 'All practice members can view patient diagnoses';
COMMENT ON POLICY patient_medications_select ON patient_medications IS 'All practice members can view patient medications';
COMMENT ON POLICY outcome_measure_scores_select ON outcome_measure_scores IS 'All practice members can view outcome measure scores';
COMMENT ON POLICY session_notes_select ON session_notes IS 'All practice members can view session notes for care coordination';
COMMENT ON POLICY session_notes_update ON session_notes IS 'Providers can only update their own draft notes';
