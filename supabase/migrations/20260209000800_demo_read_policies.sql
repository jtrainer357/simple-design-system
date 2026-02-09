-- Migration 800: Demo Read Policies
-- Created: 2026-02-08
-- Purpose: Allow anonymous read access to demo practice data for hackathon demo
-- IMPORTANT: These policies should be removed before production deployment

-- Demo practice ID (must match DEMO_PRACTICE_ID in code)
-- 550e8400-e29b-41d4-a716-446655440000

-- ============================================
-- DEMO READ POLICIES
-- These allow anonymous users to read demo data
-- ============================================

-- Patients: Allow anonymous read access to demo practice
CREATE POLICY demo_patients_anon_read ON patients
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Appointments: Allow anonymous read access to demo practice
CREATE POLICY demo_appointments_anon_read ON appointments
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Outcome Measures: Allow anonymous read access to demo practice
CREATE POLICY demo_outcome_measures_anon_read ON outcome_measures
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Messages: Allow anonymous read access to demo practice
CREATE POLICY demo_messages_anon_read ON messages
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Communications: Allow anonymous read access to demo practice
CREATE POLICY demo_communications_anon_read ON communications
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Invoices: Allow anonymous read access to demo practice
CREATE POLICY demo_invoices_anon_read ON invoices
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Priority Actions: Allow anonymous read access to demo practice
CREATE POLICY demo_priority_actions_anon_read ON priority_actions
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Practices: Allow anonymous read access to demo practice
CREATE POLICY demo_practices_anon_read ON practices
    FOR SELECT
    USING (
        id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- Reviews: Allow anonymous read access
CREATE POLICY demo_reviews_anon_read ON reviews
    FOR SELECT
    USING (
        practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
        AND auth.uid() IS NULL
    );

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY demo_patients_anon_read ON patients IS
    'DEMO ONLY: Allow anonymous read access to demo practice patients. Remove before production.';
COMMENT ON POLICY demo_appointments_anon_read ON appointments IS
    'DEMO ONLY: Allow anonymous read access to demo practice appointments. Remove before production.';
COMMENT ON POLICY demo_communications_anon_read ON communications IS
    'DEMO ONLY: Allow anonymous read access to demo practice communications. Remove before production.';
