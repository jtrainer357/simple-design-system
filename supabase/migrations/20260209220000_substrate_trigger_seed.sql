-- ============================================================================
-- Migration: Seed data for substrate trigger testing
-- Creates data that will be detected by the trigger engine
-- Uses the demo_patient_uuid() function from demo_seed_data migration
-- ============================================================================

-- Note: demo_patient_uuid() function is already defined in 20260209200000_demo_seed_data.sql
-- It creates deterministic UUIDs: uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/' || patient_slug)

-- ============================================================================
-- ADD COMPLETED APPOINTMENTS FOR UNSIGNED NOTE TRIGGERS
-- Sessions that are completed but don't have signed notes yet
-- ============================================================================

INSERT INTO appointments (id, practice_id, patient_id, date, start_time, end_time, duration_minutes, status, service_type, appointment_type)
VALUES
  -- Rachel Torres - 3 days ago - should trigger UNSIGNED_NOTE_AGING
  ('a1000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'),
   (CURRENT_DATE - INTERVAL '3 days')::date, '10:00', '10:50', 50, 'Completed', 'Individual Therapy', 'therapy'),
  -- James Okafor - 2 days ago
  ('a1000002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'),
   (CURRENT_DATE - INTERVAL '2 days')::date, '14:00', '14:50', 50, 'Completed', 'Individual Therapy', 'therapy'),
  -- Sophia Chen-Martinez - 4 days ago - urgent level
  ('a1000003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'),
   (CURRENT_DATE - INTERVAL '4 days')::date, '09:00', '09:50', 50, 'Completed', 'Individual Therapy', 'therapy')
ON CONFLICT (id) DO UPDATE SET status = 'Completed';

-- ============================================================================
-- ADD NO-SHOW APPOINTMENTS FOR MISSED APPOINTMENT TRIGGERS
-- ============================================================================

INSERT INTO appointments (id, practice_id, patient_id, date, start_time, end_time, duration_minutes, status, service_type, appointment_type)
VALUES
  -- Marcus Washington - No-show 2 days ago
  ('a2000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'),
   (CURRENT_DATE - INTERVAL '2 days')::date, '11:00', '11:50', 50, 'No-Show', 'Individual Therapy', 'therapy'),
  -- Emma Kowalski - No-show 5 days ago
  ('a2000002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'),
   (CURRENT_DATE - INTERVAL '5 days')::date, '15:00', '15:50', 50, 'No-Show', 'Individual Therapy', 'therapy')
ON CONFLICT (id) DO UPDATE SET status = 'No-Show';

-- ============================================================================
-- ADD ELEVATED OUTCOME SCORES FOR CLINICAL ALERT TRIGGERS
-- ============================================================================

INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date)
VALUES
  -- Rachel Torres - PHQ-9 spike (severe depression) - score 22 is severe
  ('a3000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 22, 27, (CURRENT_DATE - INTERVAL '1 day')::date),
  -- Previous score for comparison (baseline)
  ('a3000002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 8, 27, (CURRENT_DATE - INTERVAL '15 days')::date),

  -- James Okafor - PCL-5 elevated (PTSD symptom increase) - score 42 exceeds threshold of 32
  ('a3000006-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 42, 80, (CURRENT_DATE - INTERVAL '2 days')::date),
  -- Previous score
  ('a3000007-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 28, 80, (CURRENT_DATE - INTERVAL '16 days')::date),

  -- Sophia Chen-Martinez - GAD-7 elevated (16 is severe anxiety)
  ('a3000003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 16, 21, (CURRENT_DATE - INTERVAL '2 days')::date),
  -- Previous score
  ('a3000004-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 10, 21, (CURRENT_DATE - INTERVAL '16 days')::date),

  -- Marcus Washington - PHQ-9 moderate (15 is moderately severe)
  ('a3000005-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 15, 27, (CURRENT_DATE - INTERVAL '3 days')::date)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ADD PATIENTS NOT SEEN RECENTLY (for engagement triggers)
-- Create an older appointment record 35 days ago (exceeds 21-day threshold)
-- ============================================================================

INSERT INTO appointments (id, practice_id, patient_id, date, start_time, end_time, duration_minutes, status, service_type, appointment_type)
VALUES
  -- David Nakamura - Last seen 35 days ago, should trigger PATIENT_NOT_SEEN
  ('a4000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'),
   (CURRENT_DATE - INTERVAL '35 days')::date, '14:00', '14:50', 50, 'Completed', 'Individual Therapy', 'therapy')
ON CONFLICT (id) DO UPDATE SET status = 'Completed';
