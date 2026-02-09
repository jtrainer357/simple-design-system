-- ============================================================================
-- Migration: Seed data for substrate trigger testing
-- Creates data that will be detected by the trigger engine
-- ============================================================================

-- Add medications and treatment dates to existing patients
UPDATE patients SET
  medications = ARRAY['Sertraline 50mg', 'Buspirone 10mg'],
  treatment_start_date = (CURRENT_DATE - INTERVAL '45 days')::date
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE patients SET
  medications = ARRAY['Lexapro 20mg'],
  treatment_start_date = (CURRENT_DATE - INTERVAL '28 days')::date
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE patients SET
  medications = ARRAY['Wellbutrin 150mg', 'Trazodone 50mg'],
  treatment_start_date = (CURRENT_DATE - INTERVAL '60 days')::date
WHERE id = '33333333-3333-3333-3333-333333333333';

-- Add completed appointments from past days (for unsigned note triggers)
INSERT INTO appointments (id, practice_id, patient_id, date, start_time, end_time, duration_minutes, status, service_type, appointment_type)
VALUES
  -- 3 days ago - should trigger UNSIGNED_NOTE_AGING
  ('a1000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111',
   (CURRENT_DATE - INTERVAL '3 days')::date, '10:00', '10:50', 50, 'Completed', 'Individual Therapy', 'therapy'),
  -- 2 days ago
  ('a1000002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222',
   (CURRENT_DATE - INTERVAL '2 days')::date, '14:00', '14:50', 50, 'Completed', 'Individual Therapy', 'therapy'),
  -- 4 days ago - urgent level
  ('a1000003-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333',
   (CURRENT_DATE - INTERVAL '4 days')::date, '09:00', '09:50', 50, 'Completed', 'Individual Therapy', 'therapy')
ON CONFLICT (id) DO UPDATE SET status = 'Completed';

-- Add no-show appointments (for missed appointment triggers)
INSERT INTO appointments (id, practice_id, patient_id, date, start_time, end_time, duration_minutes, status, service_type, appointment_type)
VALUES
  ('a2000001-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444',
   (CURRENT_DATE - INTERVAL '2 days')::date, '11:00', '11:50', 50, 'No-Show', 'Individual Therapy', 'therapy'),
  ('a2000002-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '55555555-5555-5555-5555-555555555555',
   (CURRENT_DATE - INTERVAL '5 days')::date, '15:00', '15:50', 50, 'No-Show', 'Individual Therapy', 'therapy')
ON CONFLICT (id) DO UPDATE SET status = 'No-Show';

-- Add elevated outcome scores (for OUTCOME_SCORE_ELEVATED triggers)
-- Note: outcome_measure_scores doesn't have practice_id, it's inferred through patient
INSERT INTO outcome_measure_scores (id, patient_id, measure_type, total_score, administered_at)
VALUES
  -- Michael Chen - PHQ-9 spike (severe depression) - score 22 is severe
  ('a3000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'PHQ-9', 22, (CURRENT_TIMESTAMP - INTERVAL '1 day')),
  -- Previous score for comparison (baseline)
  ('a3000002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'PHQ-9', 8, (CURRENT_TIMESTAMP - INTERVAL '15 days')),

  -- Sarah Johnson - GAD-7 elevated (16 is severe anxiety)
  ('a3000003-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'GAD-7', 16, (CURRENT_TIMESTAMP - INTERVAL '2 days')),
  -- Previous score
  ('a3000004-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'GAD-7', 10, (CURRENT_TIMESTAMP - INTERVAL '16 days')),

  -- Robert Martinez - PHQ-9 moderate (15 is moderately severe)
  ('a3000005-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', 'PHQ-9', 15, (CURRENT_TIMESTAMP - INTERVAL '3 days'))
ON CONFLICT (id) DO NOTHING;
