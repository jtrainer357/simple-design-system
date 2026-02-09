-- Demo Data Seed
-- Created: 2026-02-08
-- This seeds the demo practice and sample patients for the hackathon

-- Demo Practice ID (must match DEMO_PRACTICE_ID in code)
-- 550e8400-e29b-41d4-a716-446655440000

-- Insert demo practice
INSERT INTO practices (id, name, specialty, provider_type)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Sunrise Mental Health',
    'mental_health',
    'therapist'
)
ON CONFLICT (id) DO NOTHING;

-- Insert demo patients
INSERT INTO patients (id, practice_id, first_name, last_name, date_of_birth, gender, email, phone_mobile, insurance_provider, insurance_member_id, primary_diagnosis_name, status, avatar_url) VALUES
    ('11111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', 'Michael', 'Chen', '1973-11-15', 'M', 'michael.chen@email.com', '5552345678', 'Blue Cross Blue Shield', 'BCB123456789', 'Type 2 Diabetes', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/32.jpg'),
    ('22222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', 'Sarah', 'Johnson', '1992-08-22', 'F', 'sarah.johnson@email.com', '5558765432', 'Aetna', 'AET987654321', 'New Patient', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/1.jpg'),
    ('33333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', 'Margaret', 'Williams', '1955-11-08', 'F', 'margaret.williams@email.com', '5553456789', 'Medicare', '1EG4-TE5-MK72', 'Hypertension', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/5.jpg'),
    ('44444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', 'Robert', 'Martinez', '1978-05-20', 'M', 'robert.martinez@email.com', '5554567890', 'United Healthcare', 'UHC456789123', 'Major Depressive Disorder', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/62.jpg'),
    ('55555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000', 'Emily', 'Thompson', '1988-03-14', 'F', 'emily.thompson@email.com', '5559876543', 'Cigna', 'CGN567891234', 'Generalized Anxiety Disorder', 'Inactive', 'https://xsgames.co/randomusers/assets/avatars/female/12.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert demo appointments (uses date + start_time/end_time as separate columns)
INSERT INTO appointments (id, practice_id, patient_id, date, start_time, end_time, duration_minutes, service_type, status, notes) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', '2026-02-10', '08:00:00', '08:30:00', 30, 'Follow-up', 'Scheduled', 'Diabetes management follow-up'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222', '2026-02-10', '09:00:00', '10:00:00', 60, 'New Patient', 'Scheduled', 'Initial consultation'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', '2026-02-10', '10:30:00', '11:00:00', 30, 'Follow-up', 'Scheduled', 'Blood pressure monitoring'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', '2026-02-10', '14:00:00', '14:45:00', 45, 'Therapy', 'Scheduled', 'Weekly therapy session'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', '2026-01-28', '09:00:00', '09:30:00', 30, 'Lab Review', 'Completed', 'Reviewed quarterly labs, A1C at 6.8%')
ON CONFLICT (id) DO NOTHING;

-- Insert demo messages (uses timestamp column, not created_at)
INSERT INTO messages (id, practice_id, patient_id, channel, direction, content, read, timestamp) VALUES
    ('a1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'sms', 'inbound', 'Thank you for the prescription refill reminder. I picked it up today.', false, '2026-02-04 10:30:00-08'),
    ('a2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'portal', 'inbound', 'My blood sugar readings have been stable this week. Fasting glucose averaging 118.', true, '2026-02-03 14:15:00-08'),
    ('a3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222', 'email', 'inbound', 'Can I reschedule my appointment to next week? Something came up at work.', false, '2026-02-04 09:45:00-08'),
    ('a4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', 'portal', 'inbound', 'My blood pressure readings from this morning: 132/84. A little higher than usual. Should I be concerned?', true, '2026-02-03 08:30:00-08')
ON CONFLICT (id) DO NOTHING;

-- Insert demo communications (for the Communications page)
INSERT INTO communications (id, practice_id, patient_id, channel, direction, sender, recipient, message_body, is_read, sent_at) VALUES
    ('e1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'sms', 'inbound', 'Michael Chen', 'Practice', 'Thank you for the prescription refill reminder. I picked it up today.', false, '2026-02-04 10:30:00-08'),
    ('e2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'portal', 'inbound', 'Michael Chen', 'Practice', 'My blood sugar readings have been stable this week. Fasting glucose averaging 118.', true, '2026-02-03 14:15:00-08'),
    ('e3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222', 'email', 'inbound', 'Sarah Johnson', 'Practice', 'Can I reschedule my appointment to next week? Something came up at work.', false, '2026-02-04 09:45:00-08'),
    ('e4444444-4444-4444-4444-444444444444', '550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', 'portal', 'inbound', 'Margaret Williams', 'Practice', 'My blood pressure readings from this morning: 132/84. A little higher than usual. Should I be concerned?', true, '2026-02-03 08:30:00-08'),
    ('e5555555-5555-5555-5555-555555555555', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', 'portal', 'inbound', 'Robert Martinez', 'Practice', 'I''ve been feeling better this week. The new medication seems to be helping with my sleep.', false, '2026-02-05 16:20:00-08'),
    ('e6666666-6666-6666-6666-666666666666', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', 'portal', 'outbound', 'Practice', 'Robert Martinez', 'That''s great to hear! Keep tracking your sleep patterns and we''ll review them at your next session.', true, '2026-02-05 17:45:00-08')
ON CONFLICT (id) DO NOTHING;

-- Insert demo priority actions (uses urgency, confidence_score as int 0-100)
INSERT INTO priority_actions (id, practice_id, patient_id, urgency, title, description, status, confidence_score) VALUES
    ('b1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 'high', 'Review A1C Results', 'Latest A1C results are in and need review', 'pending', 92),
    ('b2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', 'medium', 'BP Medication Adjustment', 'Consider adjusting Lisinopril dosage based on recent readings', 'pending', 85),
    ('b3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', 'high', 'PHQ-9 Follow-up', 'Patient due for depression screening follow-up', 'pending', 88)
ON CONFLICT (id) DO NOTHING;

-- Insert demo outcome measures (uses measurement_date, needs max_score)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, notes) VALUES
    ('c1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', 'PHQ-9', 14, 27, '2026-01-15', 'Moderate depression symptoms'),
    ('c2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', 'PHQ-9', 11, 27, '2026-02-01', 'Improved from previous score'),
    ('c3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', '55555555-5555-5555-5555-555555555555', 'GAD-7', 12, 21, '2026-01-20', 'Moderate anxiety symptoms')
ON CONFLICT (id) DO NOTHING;

-- Insert demo invoices (uses date_of_service, charge_amount, patient_responsibility, balance)
-- Valid statuses: Paid, Pending, Partial, Denied, Cancelled
INSERT INTO invoices (id, practice_id, patient_id, date_of_service, charge_amount, patient_responsibility, balance, status) VALUES
    ('d1111111-1111-1111-1111-111111111111', '550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', '2026-01-15', 150.00, 30.00, 30.00, 'Pending'),
    ('d2222222-2222-2222-2222-222222222222', '550e8400-e29b-41d4-a716-446655440000', '33333333-3333-3333-3333-333333333333', '2026-01-20', 250.00, 50.00, 50.00, 'Pending'),
    ('d3333333-3333-3333-3333-333333333333', '550e8400-e29b-41d4-a716-446655440000', '44444444-4444-4444-4444-444444444444', '2026-01-22', 200.00, 40.00, 0.00, 'Paid')
ON CONFLICT (id) DO NOTHING;

-- Summary
DO $$
BEGIN
    RAISE NOTICE 'Demo data seeded successfully!';
    RAISE NOTICE 'Practice: Sunrise Mental Health (550e8400-e29b-41d4-a716-446655440000)';
    RAISE NOTICE 'Patients: 5 demo patients';
    RAISE NOTICE 'Appointments: 5 demo appointments';
    RAISE NOTICE 'Messages: 4 demo messages';
    RAISE NOTICE 'Communications: 6 demo communications';
    RAISE NOTICE 'Priority Actions: 3 demo actions';
    RAISE NOTICE 'Outcome Measures: 3 demo measures';
    RAISE NOTICE 'Invoices: 3 demo invoices';
END $$;
