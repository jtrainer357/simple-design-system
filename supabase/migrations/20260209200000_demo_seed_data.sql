-- ============================================================================
-- Migration: Demo Seed Data
-- Number: 20260209200000
-- Description: Seeds 10 comprehensive demo patients with full clinical depth
--              for Patient 360 demonstration
-- Demo Date: February 9, 2026 (Monday)
-- ============================================================================

-- Demo Practice ID (deterministic)
-- 550e8400-e29b-41d4-a716-446655440000

-- ============================================================================
-- 1. ENSURE DEMO PRACTICE EXISTS
-- ============================================================================

INSERT INTO practices (id, name, settings, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Demo Mental Health Practice',
  '{"specialty": "mental_health", "timezone": "America/New_York"}',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. DEMO PATIENTS (10 comprehensive patient records)
-- ============================================================================

-- Helper function for converting demo IDs to UUIDs deterministically
CREATE OR REPLACE FUNCTION demo_patient_uuid(patient_slug TEXT) RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/' || patient_slug);
END;
$$ LANGUAGE plpgsql;

-- Insert patients with deterministic UUIDs based on their slug names
INSERT INTO patients (
  id, practice_id, external_id, client_id,
  first_name, last_name, date_of_birth, gender,
  email, phone_mobile,
  address_street, address_city, address_state, address_zip,
  insurance_provider, insurance_member_id,
  primary_diagnosis_code, primary_diagnosis_name, secondary_diagnosis_code,
  risk_level, medications, treatment_start_date,
  provider, status, avatar_url,
  created_at, updated_at
)
VALUES
-- 1. RACHEL TORRES (Depression → Recovery + Career Change)
-- Has appointment TODAY (Feb 9) at 9:00 AM
(
  demo_patient_uuid('rachel-torres-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'rachel-torres-demo', '20001',
  'Rachel', 'Torres', '1988-04-12', 'F',
  'rachel.torres@gmail.com', '(412) 555-1201',
  '412 Maple Drive', 'Mt. Lebanon', 'PA', '15228',
  'UPMC Health Plan', 'UMP928374651',
  'F33.1', 'Major Depressive Disorder, recurrent, moderate', 'F41.1',
  'low', ARRAY['Sertraline 100mg daily', 'Hydroxyzine 25mg PRN'], '2025-06-15',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/62.jpg',
  NOW(), NOW()
),
-- 2. JAMES OKAFOR (PTSD — Military Veteran)
-- Has appointment TODAY (Feb 9) at 10:30 AM
(
  demo_patient_uuid('james-okafor-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'james-okafor-demo', '20002',
  'James', 'Okafor', '1985-09-22', 'M',
  'james.okafor@outlook.com', '(412) 555-1202',
  '267 Birch Lane', 'Bethel Park', 'PA', '15102',
  'Tricare', 'TRC118845523',
  'F43.10', 'Post-Traumatic Stress Disorder', 'F51.01',
  'medium', ARRAY['Prazosin 2mg at bedtime', 'Sertraline 150mg daily'], '2025-04-10',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/9.jpg',
  NOW(), NOW()
),
-- 3. SOPHIA CHEN-MARTINEZ (Anxiety + Perfectionism — Graduate Student)
-- Has appointment TODAY (Feb 9) at 1:00 PM
(
  demo_patient_uuid('sophia-chen-martinez-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'sophia-chen-martinez-demo', '20003',
  'Sophia', 'Chen-Martinez', '1997-01-30', 'F',
  'sophia.cm@pitt.edu', '(412) 555-1203',
  '1845 Murray Ave', 'Squirrel Hill', 'PA', '15217',
  'Aetna Student Health', 'AET556789012',
  'F41.1', 'Generalized Anxiety Disorder', NULL,
  'low', ARRAY['Buspirone 15mg BID'], '2025-09-01',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/30.jpg',
  NOW(), NOW()
),
-- 4. MARCUS WASHINGTON (Bipolar II — Stable Maintenance)
-- Has appointment TODAY (Feb 9) at 3:30 PM
(
  demo_patient_uuid('marcus-washington-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'marcus-washington-demo', '20004',
  'Marcus', 'Washington', '1976-12-08', 'M',
  'marcus.w76@gmail.com', '(412) 555-1204',
  '530 Brownsville Rd', 'Pittsburgh', 'PA', '15210',
  'Highmark BCBS', 'HMK443216789',
  'F31.81', 'Bipolar II Disorder', 'F10.20',
  'medium', ARRAY['Lamotrigine 200mg daily', 'Quetiapine 50mg at bedtime'], '2024-11-15',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/16.jpg',
  NOW(), NOW()
),
-- 5. EMMA KOWALSKI (Eating Disorder Recovery)
-- Next appointment: Feb 12 at 11:00 AM
(
  demo_patient_uuid('emma-kowalski-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'emma-kowalski-demo', '20005',
  'Emma', 'Kowalski', '2001-07-19', 'F',
  'emma.kowalski@icloud.com', '(412) 555-1205',
  '89 Washington Rd', 'Mt. Lebanon', 'PA', '15228',
  'UPMC Health Plan', 'UMP667788990',
  'F50.02', 'Bulimia Nervosa, in partial remission', 'F33.0',
  'medium', ARRAY['Fluoxetine 60mg daily'], '2025-03-20',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/8.jpg',
  NOW(), NOW()
),
-- 6. DAVID NAKAMURA (Couples Presenting as Individual — Work Stress)
-- Next appointment: Feb 10 at 2:00 PM
(
  demo_patient_uuid('david-nakamura-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'david-nakamura-demo', '20006',
  'David', 'Nakamura', '1982-03-14', 'M',
  'd.nakamura@techcorp.com', '(412) 555-1206',
  '1620 Cochran Rd', 'Upper St. Clair', 'PA', '15241',
  'Cigna', 'CIG334455667',
  'F43.20', 'Adjustment Disorder with mixed anxiety and depressed mood', NULL,
  'low', NULL, '2025-10-01',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/32.jpg',
  NOW(), NOW()
),
-- 7. AALIYAH BROOKS (Adolescent/Young Adult — Social Anxiety + Identity)
-- Next appointment: Feb 11 at 4:00 PM
(
  demo_patient_uuid('aaliyah-brooks-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'aaliyah-brooks-demo', '20007',
  'Aaliyah', 'Brooks', '2004-11-25', 'F',
  'aaliyah.b04@gmail.com', '(412) 555-1207',
  '345 Castle Shannon Blvd', 'Pittsburgh', 'PA', '15234',
  'Highmark BCBS', 'HMK998877665',
  'F40.10', 'Social Anxiety Disorder', 'F64.0',
  'low', ARRAY['Escitalopram 10mg daily'], '2025-08-15',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/7.jpg',
  NOW(), NOW()
),
-- 8. ROBERT FITZGERALD (Geriatric — Grief + Cognitive Concerns)
-- Next appointment: Feb 13 at 10:00 AM
(
  demo_patient_uuid('robert-fitzgerald-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'robert-fitzgerald-demo', '20008',
  'Robert', 'Fitzgerald', '1948-06-30', 'M',
  'bobfitz48@aol.com', '(412) 555-1208',
  '2100 Bower Hill Rd', 'Mt. Lebanon', 'PA', '15228',
  'Medicare', 'MCR1A2B3C4D5',
  'F43.21', 'Adjustment Disorder with depressed mood', 'R41.81',
  'medium', ARRAY['Mirtazapine 15mg at bedtime'], '2025-07-01',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/5.jpg',
  NOW(), NOW()
),
-- 9. CARMEN ALVAREZ (Postpartum Depression — New Mother) - HIGH RISK
-- Next appointment: Feb 14 at 9:00 AM
(
  demo_patient_uuid('carmen-alvarez-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'carmen-alvarez-demo', '20009',
  'Carmen', 'Alvarez', '1993-02-17', 'F',
  'carmen.alvarez93@yahoo.com', '(412) 555-1209',
  '1450 E Carson St', 'Pittsburgh', 'PA', '15203',
  'UPMC for You (Medicaid)', 'UMY445566778',
  'F53.0', 'Postpartum Depression', 'F41.1',
  'high', ARRAY['Sertraline 75mg daily'], '2025-11-01',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/female/67.jpg',
  NOW(), NOW()
),
-- 10. TYLER HARRISON (NEW PATIENT — Intake Scheduled)
-- NEW PATIENT - Has intake TODAY (Feb 9) at 4:30 PM
(
  demo_patient_uuid('tyler-harrison-demo'),
  '550e8400-e29b-41d4-a716-446655440000',
  'tyler-harrison-demo', '20010',
  'Tyler', 'Harrison', '1990-08-05', 'M',
  'tyler.harrison90@gmail.com', '(412) 555-1210',
  '780 Liberty Ave', 'Pittsburgh', 'PA', '15222',
  'Self-Pay', '',
  '', 'Pending Intake Evaluation', NULL,
  'low', NULL, '2026-02-09',
  'Dr. Demo', 'Active', 'https://xsgames.co/randomusers/assets/avatars/male/1.jpg',
  NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. APPOINTMENTS
-- ============================================================================

-- Helper function for appointment UUIDs
CREATE OR REPLACE FUNCTION demo_appointment_uuid(apt_slug TEXT) RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/apt/' || apt_slug);
END;
$$ LANGUAGE plpgsql;

-- RACHEL TORRES appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('rachel-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-001', '2025-06-22', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('rachel-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-002', '2025-07-20', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('rachel-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-003', '2025-09-14', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('rachel-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-004', '2025-10-26', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('rachel-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-005', '2025-12-07', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('rachel-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-006', '2026-01-26', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('rachel-007'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'apt-demo-rachel-007', '2026-02-09', '09:00', '09:53', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', 'Depression maintenance check-in, career transition update', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- JAMES OKAFOR appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('james-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'apt-demo-james-001', '2025-04-17', '10:30', '11:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('james-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'apt-demo-james-002', '2025-06-12', '10:30', '11:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('james-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'apt-demo-james-003', '2025-08-07', '10:30', '11:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('james-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'apt-demo-james-004', '2025-09-15', '10:30', '11:23', 53, 'No-Show', 'Individual Therapy (60 min)', '90837', 'Main Office', 'Patient did not attend - work conflict', NOW(), NOW()),
(demo_appointment_uuid('james-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'apt-demo-james-005', '2025-11-20', '10:30', '11:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('james-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'apt-demo-james-006', '2026-02-09', '10:30', '11:23', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', 'CPT trauma narrative - continue processing', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- SOPHIA CHEN-MARTINEZ appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('sophia-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'apt-demo-sophia-001', '2025-09-08', '13:00', '13:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('sophia-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'apt-demo-sophia-002', '2025-10-06', '13:00', '13:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('sophia-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'apt-demo-sophia-003', '2025-11-03', '13:00', '13:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('sophia-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'apt-demo-sophia-004', '2025-12-01', '13:00', '13:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('sophia-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'apt-demo-sophia-005', '2026-01-12', '13:00', '13:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('sophia-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'apt-demo-sophia-006', '2026-02-09', '13:00', '13:45', 45, 'Scheduled', 'Individual Therapy (45 min)', '90834', 'Main Office', 'Academic anxiety - qualifying exams approaching', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- MARCUS WASHINGTON appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('marcus-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-001', '2024-12-02', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-002', '2025-01-06', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-003', '2025-02-03', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-004', '2025-03-03', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-005', '2025-05-05', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-006', '2025-07-07', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-007'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-007', '2025-09-08', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-008'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-008', '2026-01-12', '15:30', '16:23', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('marcus-009'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'apt-demo-marcus-009', '2026-02-09', '15:30', '16:23', 53, 'Scheduled', 'Med Management + Therapy', '90837', 'Main Office', '8-month stability review, bipolar maintenance', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- EMMA KOWALSKI appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('emma-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'apt-demo-emma-001', '2025-04-01', '11:00', '11:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('emma-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'apt-demo-emma-002', '2025-06-15', '11:00', '11:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('emma-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'apt-demo-emma-003', '2025-09-22', '11:00', '11:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('emma-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'apt-demo-emma-004', '2026-01-29', '11:00', '11:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('emma-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'apt-demo-emma-005', '2026-02-10', '10:00', '10:53', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('emma-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'apt-demo-emma-006', '2026-02-12', '11:00', '11:53', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', 'ED recovery check-in, body image work', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- DAVID NAKAMURA appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('david-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'apt-demo-david-001', '2025-10-08', '14:00', '14:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('david-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'apt-demo-david-002', '2025-11-05', '14:00', '14:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('david-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'apt-demo-david-003', '2025-12-03', '14:00', '14:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('david-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'apt-demo-david-004', '2026-01-28', '14:00', '14:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('david-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'apt-demo-david-005', '2026-02-10', '14:00', '14:53', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', 'Work-life balance, wife may join', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AALIYAH BROOKS appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('aaliyah-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'apt-demo-aaliyah-001', '2025-08-20', '16:00', '16:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('aaliyah-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'apt-demo-aaliyah-002', '2025-09-17', '16:00', '16:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('aaliyah-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'apt-demo-aaliyah-003', '2025-10-15', '16:00', '16:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('aaliyah-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'apt-demo-aaliyah-004', '2025-11-05', '16:00', '16:45', 45, 'Cancelled', 'Individual Therapy (45 min)', '90834', 'Main Office', 'Patient cancelled - school conflict', NOW(), NOW()),
(demo_appointment_uuid('aaliyah-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'apt-demo-aaliyah-005', '2026-01-28', '16:00', '16:45', 45, 'Completed', 'Individual Therapy (45 min)', '90834', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('aaliyah-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'apt-demo-aaliyah-006', '2026-02-11', '16:00', '16:45', 45, 'Scheduled', 'Individual Therapy (45 min)', '90834', 'Main Office', 'Social anxiety exposure hierarchy, identity exploration', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ROBERT FITZGERALD appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('robert-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'apt-demo-robert-001', '2025-07-10', '10:00', '10:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('robert-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'apt-demo-robert-002', '2025-08-21', '10:00', '10:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('robert-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'apt-demo-robert-003', '2025-10-02', '10:00', '10:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('robert-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'apt-demo-robert-004', '2025-11-13', '10:00', '10:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('robert-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'apt-demo-robert-005', '2026-01-30', '10:00', '10:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('robert-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'apt-demo-robert-006', '2026-02-13', '10:00', '10:53', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', 'Grief processing, cognitive screening follow-up', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- CARMEN ALVAREZ appointments
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('carmen-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'apt-demo-carmen-001', '2025-11-10', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('carmen-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'apt-demo-carmen-002', '2025-11-24', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('carmen-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'apt-demo-carmen-003', '2025-12-15', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('carmen-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'apt-demo-carmen-004', '2026-02-07', '09:00', '09:53', 53, 'Completed', 'Individual Therapy (60 min)', '90837', 'Main Office', NULL, NOW(), NOW()),
(demo_appointment_uuid('carmen-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'apt-demo-carmen-005', '2026-02-14', '09:00', '09:53', 53, 'Scheduled', 'Individual Therapy (60 min)', '90837', 'Main Office', 'PPD follow-up, bonding assessment, safety check', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- TYLER HARRISON appointment (NEW PATIENT)
INSERT INTO appointments (id, practice_id, patient_id, external_id, date, start_time, end_time, duration_minutes, status, service_type, cpt_code, location, notes, created_at, updated_at)
VALUES
(demo_appointment_uuid('tyler-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('tyler-harrison-demo'), 'apt-demo-tyler-001', '2026-02-09', '16:30', '17:30', 60, 'Scheduled', 'Initial Evaluation', '90791', 'Main Office', 'NEW PATIENT INTAKE - stress, relationship issues, anger management', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. OUTCOME MEASURES
-- ============================================================================

-- Helper function for outcome measure UUIDs
CREATE OR REPLACE FUNCTION demo_outcome_uuid(om_slug TEXT) RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/om/' || om_slug);
END;
$$ LANGUAGE plpgsql;

-- RACHEL TORRES - PHQ-9 and GAD-7 (Depression recovery: 18→14→10→7→5→5)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('rachel-phq9-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 18, 27, '2025-06-22', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-gad7-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'GAD-7', 12, 21, '2025-06-22', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-phq9-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 14, 27, '2025-07-20', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-gad7-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'GAD-7', 10, 21, '2025-07-20', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-phq9-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 10, 27, '2025-09-14', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-gad7-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'GAD-7', 8, 21, '2025-09-14', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-phq9-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 7, 27, '2025-10-26', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-gad7-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'GAD-7', 6, 21, '2025-10-26', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-phq9-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 5, 27, '2025-12-07', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-gad7-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'GAD-7', 5, 21, '2025-12-07', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-phq9-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'PHQ-9', 5, 27, '2026-01-26', 'Dr. Demo', NOW()),
(demo_outcome_uuid('rachel-gad7-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'GAD-7', 4, 21, '2026-01-26', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- JAMES OKAFOR - PCL-5 and PHQ-9 (PTSD improvement: 58→52→44→38→32)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('james-pcl5-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 58, 80, '2025-04-17', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-phq9-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PHQ-9', 14, 27, '2025-04-17', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-pcl5-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 52, 80, '2025-06-12', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-phq9-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PHQ-9', 12, 27, '2025-06-12', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-pcl5-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 44, 80, '2025-08-07', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-phq9-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PHQ-9', 10, 27, '2025-08-07', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-pcl5-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 38, 80, '2025-11-20', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-phq9-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PHQ-9', 8, 27, '2025-11-20', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-pcl5-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PCL-5', 32, 80, '2026-01-26', 'Dr. Demo', NOW()),
(demo_outcome_uuid('james-phq9-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'PHQ-9', 7, 27, '2026-01-26', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- SOPHIA CHEN-MARTINEZ - GAD-7 (Academic anxiety: 16→14→12→10→8)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('sophia-gad7-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 16, 21, '2025-09-08', 'Dr. Demo', NOW()),
(demo_outcome_uuid('sophia-gad7-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 14, 21, '2025-10-06', 'Dr. Demo', NOW()),
(demo_outcome_uuid('sophia-gad7-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 12, 21, '2025-11-03', 'Dr. Demo', NOW()),
(demo_outcome_uuid('sophia-gad7-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 10, 21, '2025-12-01', 'Dr. Demo', NOW()),
(demo_outcome_uuid('sophia-gad7-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'GAD-7', 8, 21, '2026-01-12', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- MARCUS WASHINGTON - PHQ-9 (Bipolar stable: 8→6→5→4→5→4→6→4)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('marcus-phq9-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 8, 27, '2024-12-02', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 6, 27, '2025-01-06', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 5, 27, '2025-02-03', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 4, 27, '2025-03-03', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 5, 27, '2025-05-05', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 4, 27, '2025-07-07', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-007'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 6, 27, '2025-09-08', 'Dr. Demo', NOW()),
(demo_outcome_uuid('marcus-phq9-008'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'PHQ-9', 4, 27, '2026-01-12', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- EMMA KOWALSKI - PHQ-9 (Bulimia recovery: 12→10→8→6)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('emma-phq9-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'PHQ-9', 12, 27, '2025-04-01', 'Dr. Demo', NOW()),
(demo_outcome_uuid('emma-phq9-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'PHQ-9', 10, 27, '2025-06-15', 'Dr. Demo', NOW()),
(demo_outcome_uuid('emma-phq9-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'PHQ-9', 8, 27, '2025-09-22', 'Dr. Demo', NOW()),
(demo_outcome_uuid('emma-phq9-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'PHQ-9', 6, 27, '2026-01-29', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- DAVID NAKAMURA - GAD-7 (Work stress: 14→12→10→9)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('david-gad7-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'GAD-7', 14, 21, '2025-10-08', 'Dr. Demo', NOW()),
(demo_outcome_uuid('david-gad7-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'GAD-7', 12, 21, '2025-11-05', 'Dr. Demo', NOW()),
(demo_outcome_uuid('david-gad7-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'GAD-7', 10, 21, '2025-12-03', 'Dr. Demo', NOW()),
(demo_outcome_uuid('david-gad7-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'GAD-7', 9, 21, '2026-01-28', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- AALIYAH BROOKS - GAD-7 (Social anxiety: 18→15→13→11→9)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('aaliyah-gad7-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'GAD-7', 18, 21, '2025-08-20', 'Dr. Demo', NOW()),
(demo_outcome_uuid('aaliyah-gad7-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'GAD-7', 15, 21, '2025-09-17', 'Dr. Demo', NOW()),
(demo_outcome_uuid('aaliyah-gad7-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'GAD-7', 13, 21, '2025-10-15', 'Dr. Demo', NOW()),
(demo_outcome_uuid('aaliyah-gad7-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'GAD-7', 11, 21, '2025-11-05', 'Dr. Demo', NOW()),
(demo_outcome_uuid('aaliyah-gad7-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'GAD-7', 9, 21, '2026-01-28', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- ROBERT FITZGERALD - PHQ-9 (Grief: 20→16→14→11→9)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('robert-phq9-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'PHQ-9', 20, 27, '2025-07-10', 'Dr. Demo', NOW()),
(demo_outcome_uuid('robert-phq9-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'PHQ-9', 16, 27, '2025-08-21', 'Dr. Demo', NOW()),
(demo_outcome_uuid('robert-phq9-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'PHQ-9', 14, 27, '2025-10-02', 'Dr. Demo', NOW()),
(demo_outcome_uuid('robert-phq9-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'PHQ-9', 11, 27, '2025-11-13', 'Dr. Demo', NOW()),
(demo_outcome_uuid('robert-phq9-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'PHQ-9', 9, 27, '2026-01-30', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- CARMEN ALVAREZ - PHQ-9 and GAD-7 (Postpartum: 21→18→14→11)
INSERT INTO outcome_measures (id, practice_id, patient_id, measure_type, score, max_score, measurement_date, administered_by, created_at)
VALUES
(demo_outcome_uuid('carmen-phq9-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'PHQ-9', 21, 27, '2025-11-10', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-gad7-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'GAD-7', 17, 21, '2025-11-10', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-phq9-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'PHQ-9', 18, 27, '2025-11-24', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-gad7-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'GAD-7', 14, 21, '2025-11-24', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-phq9-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'PHQ-9', 14, 27, '2025-12-15', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-gad7-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'GAD-7', 11, 21, '2025-12-15', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-phq9-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'PHQ-9', 11, 27, '2026-02-07', 'Dr. Demo', NOW()),
(demo_outcome_uuid('carmen-gad7-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'GAD-7', 9, 21, '2026-02-07', 'Dr. Demo', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. MESSAGES
-- ============================================================================

-- Helper function for message UUIDs
CREATE OR REPLACE FUNCTION demo_message_uuid(msg_slug TEXT) RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/msg/' || msg_slug);
END;
$$ LANGUAGE plpgsql;

INSERT INTO messages (id, practice_id, patient_id, direction, channel, content, timestamp, read, created_at)
VALUES
-- CARMEN ALVAREZ - Critical "scary thoughts" message (UNREAD - triggers substrate alert)
(demo_message_uuid('carmen-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'inbound', 'sms', 'Having a hard day. The baby won''t stop crying and I keep having those scary thoughts. I used the coping card.', '2026-02-08T16:45:00Z', false, NOW()),
(demo_message_uuid('carmen-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'outbound', 'sms', 'Carmen, I''m glad you used the coping card. Remember: thoughts are not actions. You''re a good mom. If you need to talk before Friday, call the office.', '2026-02-08T17:15:00Z', true, NOW()),
(demo_message_uuid('carmen-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'outbound', 'sms', 'Checking in after our session. How are you and baby doing this week?', '2026-02-05T14:00:00Z', true, NOW()),
(demo_message_uuid('carmen-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'inbound', 'sms', 'Better today. Mom came over to help. Got 4 hours of sleep in a row!', '2026-02-05T16:30:00Z', true, NOW()),

-- JAMES OKAFOR - Nightmare message (UNREAD)
(demo_message_uuid('james-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'outbound', 'sms', 'Hi James, confirming your 10:30 AM appointment Monday. We''ll continue the trauma narrative work.', '2026-02-07T10:00:00Z', true, NOW()),
(demo_message_uuid('james-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'inbound', 'sms', 'Confirmed. Had a rough night with nightmares but used the grounding technique. Helped some.', '2026-02-08T08:15:00Z', false, NOW()),

-- SOPHIA CHEN-MARTINEZ - Exam anxiety message (UNREAD)
(demo_message_uuid('sophia-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'inbound', 'sms', 'Dr. Demo, I''ve been really anxious about qualifying exams. Can we talk about it Monday?', '2026-02-08T19:30:00Z', false, NOW()),
(demo_message_uuid('sophia-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'outbound', 'sms', 'Remember: perfectionism is the enemy of progress. You''re doing great work, Sophia.', '2026-02-01T17:00:00Z', true, NOW()),

-- RACHEL TORRES
(demo_message_uuid('rachel-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'outbound', 'sms', 'Hi Rachel, just a reminder about your appointment Monday at 9 AM. Looking forward to hearing about the new job!', '2026-02-07T14:00:00Z', true, NOW()),
(demo_message_uuid('rachel-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'inbound', 'sms', 'Thanks! Yes I''ll be there. Had a really good first week at the new place :)', '2026-02-07T15:30:00Z', true, NOW()),

-- MARCUS WASHINGTON
(demo_message_uuid('marcus-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'outbound', 'sms', 'Hi Marcus, confirming your 3:30 PM appointment Monday. We''ll do your 8-month stability review.', '2026-02-07T11:00:00Z', true, NOW()),
(demo_message_uuid('marcus-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'inbound', 'sms', 'Thanks! Looking forward to it. 8 months stable - feels good to say that.', '2026-02-07T12:30:00Z', true, NOW()),

-- EMMA KOWALSKI
(demo_message_uuid('emma-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'outbound', 'sms', 'Hi Emma, reminder about your appointment Tuesday 2/10 at 10 AM. See you then!', '2026-02-08T10:00:00Z', true, NOW()),
(demo_message_uuid('emma-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'inbound', 'sms', 'Thanks! I''ll be there. Had a good week - no slips.', '2026-02-08T11:30:00Z', true, NOW()),

-- DAVID NAKAMURA
(demo_message_uuid('david-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'outbound', 'sms', 'Hi David, confirming Tuesday 2/10 at 2 PM. Your wife will be joining us - please confirm she received the pre-session questionnaire.', '2026-02-07T14:00:00Z', true, NOW()),
(demo_message_uuid('david-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'inbound', 'sms', 'Confirmed! Yes, she completed it last night. We''re both looking forward to this.', '2026-02-07T16:00:00Z', true, NOW()),

-- AALIYAH BROOKS
(demo_message_uuid('aaliyah-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'outbound', 'sms', 'Hi Aaliyah, reminder about your appointment Wednesday 2/11 at 4 PM.', '2026-02-08T12:00:00Z', true, NOW()),
(demo_message_uuid('aaliyah-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'inbound', 'sms', 'Thanks! I''ll be there. Feeling more confident lately, want to talk about next steps.', '2026-02-08T14:00:00Z', true, NOW()),

-- ROBERT FITZGERALD
(demo_message_uuid('robert-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'outbound', 'sms', 'Hi Robert, confirming your appointment Thursday 2/13 at 10 AM. Looking forward to our session.', '2026-02-08T09:00:00Z', true, NOW()),
(demo_message_uuid('robert-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'inbound', 'sms', 'Thank you Dr Demo. I will be there. Just passed one year since Ellen - lots to discuss.', '2026-02-08T10:30:00Z', true, NOW()),

-- TYLER HARRISON - New patient intake emails
(demo_message_uuid('tyler-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('tyler-harrison-demo'), 'outbound', 'email', E'Subject: Welcome to our practice — Your intake appointment\n\nDear Mr. Harrison,\n\nWelcome to our practice! Your initial evaluation is scheduled for Monday, February 9, 2026 at 4:30 PM.\n\nPlease complete the attached intake forms before your appointment.\n\nWe look forward to meeting you.\n\nBest regards,\nDr. Demo''s Office', '2026-02-06T10:00:00Z', true, NOW()),
(demo_message_uuid('tyler-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('tyler-harrison-demo'), 'outbound', 'email', E'Subject: Appointment reminder: Monday Feb 9 at 4:30 PM\n\nHi Tyler,\n\nThis is a reminder about your intake appointment tomorrow.\n\nDate: Monday, February 9, 2026\nTime: 4:30 PM\nLocation: Main Office\n\nSee you tomorrow!\nDr. Demo''s Office', '2026-02-08T10:00:00Z', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. INVOICES / BILLING
-- ============================================================================

-- Helper function for invoice UUIDs
CREATE OR REPLACE FUNCTION demo_invoice_uuid(inv_slug TEXT) RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/inv/' || inv_slug);
END;
$$ LANGUAGE plpgsql;

-- RACHEL TORRES - All paid (good payer)
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('rachel-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), demo_appointment_uuid('rachel-001'), 'inv-demo-rachel-001', '2025-06-22', '90791', 200, 160, 40, 40, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('rachel-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), demo_appointment_uuid('rachel-002'), 'inv-demo-rachel-002', '2025-07-20', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('rachel-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), demo_appointment_uuid('rachel-003'), 'inv-demo-rachel-003', '2025-09-14', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('rachel-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), demo_appointment_uuid('rachel-004'), 'inv-demo-rachel-004', '2025-10-26', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('rachel-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), demo_appointment_uuid('rachel-005'), 'inv-demo-rachel-005', '2025-12-07', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('rachel-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), demo_appointment_uuid('rachel-006'), 'inv-demo-rachel-006', '2026-01-26', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- JAMES OKAFOR - Tricare 100% coverage
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('james-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), demo_appointment_uuid('james-001'), 'inv-demo-james-001', '2025-04-17', '90791', 200, 200, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('james-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), demo_appointment_uuid('james-002'), 'inv-demo-james-002', '2025-06-12', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('james-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), demo_appointment_uuid('james-003'), 'inv-demo-james-003', '2025-08-07', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('james-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), demo_appointment_uuid('james-005'), 'inv-demo-james-004', '2025-11-20', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- SOPHIA CHEN-MARTINEZ - One copay outstanding ($50)
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('sophia-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), demo_appointment_uuid('sophia-001'), 'inv-demo-sophia-001', '2025-09-08', '90791', 200, 160, 40, 40, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('sophia-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), demo_appointment_uuid('sophia-002'), 'inv-demo-sophia-002', '2025-10-06', '90834', 150, 120, 30, 30, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('sophia-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), demo_appointment_uuid('sophia-003'), 'inv-demo-sophia-003', '2025-11-03', '90834', 150, 120, 30, 30, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('sophia-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), demo_appointment_uuid('sophia-004'), 'inv-demo-sophia-004', '2025-12-01', '90834', 150, 120, 30, 30, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('sophia-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), demo_appointment_uuid('sophia-005'), 'inv-demo-sophia-005', '2026-01-12', '90834', 150, 100, 50, 0, 50, 'Pending', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- MARCUS WASHINGTON - All paid
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('marcus-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-001'), 'inv-demo-marcus-001', '2024-12-02', '90791', 200, 160, 40, 40, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-002'), 'inv-demo-marcus-002', '2025-01-06', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-003'), 'inv-demo-marcus-003', '2025-02-03', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-004'), 'inv-demo-marcus-004', '2025-03-03', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-005'), 'inv-demo-marcus-005', '2025-05-05', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-006'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-006'), 'inv-demo-marcus-006', '2025-07-07', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-007'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-007'), 'inv-demo-marcus-007', '2025-09-08', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('marcus-008'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), demo_appointment_uuid('marcus-008'), 'inv-demo-marcus-008', '2026-01-12', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- EMMA KOWALSKI - $75 outstanding (2 copays)
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('emma-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), demo_appointment_uuid('emma-001'), 'inv-demo-emma-001', '2025-04-01', '90791', 200, 160, 40, 40, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('emma-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), demo_appointment_uuid('emma-002'), 'inv-demo-emma-002', '2025-06-15', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('emma-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), demo_appointment_uuid('emma-003'), 'inv-demo-emma-003', '2025-09-22', '90837', 175, 140, 35, 0, 35, 'Pending', NOW(), NOW()),
(demo_invoice_uuid('emma-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), demo_appointment_uuid('emma-004'), 'inv-demo-emma-004', '2026-01-29', '90837', 175, 135, 40, 0, 40, 'Pending', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- DAVID NAKAMURA - All paid
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('david-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), demo_appointment_uuid('david-001'), 'inv-demo-david-001', '2025-10-08', '90791', 200, 160, 40, 40, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('david-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), demo_appointment_uuid('david-002'), 'inv-demo-david-002', '2025-11-05', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('david-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), demo_appointment_uuid('david-003'), 'inv-demo-david-003', '2025-12-03', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('david-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), demo_appointment_uuid('david-004'), 'inv-demo-david-004', '2026-01-28', '90837', 175, 140, 35, 35, 0, 'Paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AALIYAH BROOKS - $30 outstanding
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('aaliyah-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), demo_appointment_uuid('aaliyah-001'), 'inv-demo-aaliyah-001', '2025-08-20', '90791', 200, 160, 40, 40, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('aaliyah-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), demo_appointment_uuid('aaliyah-002'), 'inv-demo-aaliyah-002', '2025-09-17', '90834', 150, 120, 30, 30, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('aaliyah-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), demo_appointment_uuid('aaliyah-003'), 'inv-demo-aaliyah-003', '2025-10-15', '90834', 150, 120, 30, 30, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('aaliyah-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), demo_appointment_uuid('aaliyah-005'), 'inv-demo-aaliyah-004', '2026-01-28', '90834', 150, 120, 30, 0, 30, 'Pending', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ROBERT FITZGERALD - Medicare 100%
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('robert-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), demo_appointment_uuid('robert-001'), 'inv-demo-robert-001', '2025-07-10', '90791', 200, 200, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('robert-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), demo_appointment_uuid('robert-002'), 'inv-demo-robert-002', '2025-08-21', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('robert-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), demo_appointment_uuid('robert-003'), 'inv-demo-robert-003', '2025-10-02', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('robert-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), demo_appointment_uuid('robert-004'), 'inv-demo-robert-004', '2025-11-13', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('robert-005'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), demo_appointment_uuid('robert-005'), 'inv-demo-robert-005', '2026-01-30', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- CARMEN ALVAREZ - Medicaid 100%
INSERT INTO invoices (id, practice_id, patient_id, appointment_id, external_id, date_of_service, cpt_code, charge_amount, insurance_paid, patient_responsibility, patient_paid, balance, status, created_at, updated_at)
VALUES
(demo_invoice_uuid('carmen-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), demo_appointment_uuid('carmen-001'), 'inv-demo-carmen-001', '2025-11-10', '90791', 200, 200, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('carmen-002'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), demo_appointment_uuid('carmen-002'), 'inv-demo-carmen-002', '2025-11-24', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('carmen-003'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), demo_appointment_uuid('carmen-003'), 'inv-demo-carmen-003', '2025-12-15', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW()),
(demo_invoice_uuid('carmen-004'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), demo_appointment_uuid('carmen-004'), 'inv-demo-carmen-004', '2026-02-07', '90837', 175, 175, 0, 0, 0, 'Paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- TYLER HARRISON - No invoices (new patient)

-- ============================================================================
-- 7. PRIORITY ACTIONS (Substrate Intelligence)
-- ============================================================================

-- Helper function for priority action UUIDs
CREATE OR REPLACE FUNCTION demo_action_uuid(action_slug TEXT) RETURNS UUID AS $$
BEGIN
  RETURN uuid_generate_v5(uuid_ns_url(), 'https://demo.mhmvp/action/' || action_slug);
END;
$$ LANGUAGE plpgsql;

INSERT INTO priority_actions (id, practice_id, patient_id, urgency, title, description, clinical_context, ai_reasoning, confidence_score, timeframe, suggested_actions, status, created_at, updated_at)
VALUES
-- URGENT: Carmen Alvarez - Intrusive thoughts
(demo_action_uuid('carmen-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('carmen-alvarez-demo'), 'urgent', 'Intrusive Thought Pattern Detected',
'Patient reported increased frequency of intrusive thoughts about infant safety.',
'Patient reported increased frequency of intrusive thoughts about infant safety at last visit (Feb 7). Edinburgh Postnatal Depression Scale score 10 warrants continued close monitoring. Message received Feb 8 indicates patient experiencing another hard day with intrusive thoughts. Patient used coping card appropriately but warrants safety check-in.',
'Pattern detected: escalating intrusive thoughts + unread message mentioning scary thoughts. High confidence this requires immediate clinical attention.',
91, 'Immediate',
'["Schedule safety check-in call", "Review safety plan", "Consult with psychiatrist re: medication adjustment", "Confirm Feb 14 appointment"]'::jsonb,
'pending', NOW(), NOW()),

-- URGENT: Tyler Harrison - New patient intake
(demo_action_uuid('tyler-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('tyler-harrison-demo'), 'urgent', 'New Patient Intake — Prepare Assessment',
'First appointment scheduled today. Screen for IPV risk factors.',
'First appointment scheduled today at 4:30 PM. Self-referred for stress and relationship issues. Intake form mentions anger management concerns — screen for IPV risk factors and safety considerations. No prior mental health treatment history on file.',
'New patient with relationship issues and anger management concerns warrants thorough intake with safety screening.',
95, 'Today',
'["Review intake paperwork", "Prepare PHQ-9 + GAD-7 + PCL-5 battery", "Set up telehealth backup", "Screen for IPV risk factors", "Complete comprehensive diagnostic assessment"]'::jsonb,
'pending', NOW(), NOW()),

-- HIGH: James Okafor - PTSD improvement
(demo_action_uuid('james-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('james-okafor-demo'), 'high', 'Significant PTSD Symptom Improvement',
'PCL-5 decreased 45% over 5 sessions, crossing below clinical threshold.',
'PCL-5 decreased from 58 to 32 over 5 sessions (45% reduction). Patient has crossed below clinical threshold (31-33). Consider transitioning from weekly trauma processing to biweekly maintenance. Administer PCL-5 today to verify sustained improvement.',
'Consistent downward trajectory in PCL-5 scores indicates treatment response. Threshold crossed warrants discussion of treatment phase transition.',
94, 'Today',
'["Discuss treatment phase transition", "Administer PCL-5 today", "Update treatment plan goals", "Plan relapse prevention session"]'::jsonb,
'pending', NOW(), NOW()),

-- HIGH: Marcus Washington - Bipolar stability review
(demo_action_uuid('marcus-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('marcus-washington-demo'), 'high', 'Bipolar Stability Check — 8 Month Review',
'No hypomanic episodes in 8 months. Due for comprehensive stability review.',
'No hypomanic episodes in 8 months. Mood stable. AA attendance consistent (2+ years sober). Lamotrigine therapeutic. Due for comprehensive stability review and discussion of long-term maintenance plan at today''s 3:30 PM session.',
'Extended mood stability milestone warrants celebration and review of maintenance strategy.',
88, 'Today',
'["Complete mood stability assessment", "Review medication side effects", "Discuss relapse prevention plan update", "Celebrate 8-month stability milestone"]'::jsonb,
'pending', NOW(), NOW()),

-- HIGH: Rachel Torres - Depression remission
(demo_action_uuid('rachel-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('rachel-torres-demo'), 'high', 'Depression in Remission — Consider Step-Down',
'PHQ-9 score of 5 for two consecutive visits. Ready to discuss reducing session frequency.',
'PHQ-9 score of 5 for two consecutive visits (Dec 7 and Jan 26). Patient reports sustained improvement in mood, energy, and social functioning. Career transition completed successfully. Ready to discuss reducing session frequency and medication taper readiness.',
'Sustained PHQ-9 scores below clinical threshold with functional improvement suggests remission.',
92, 'Today',
'["Discuss reducing session frequency to monthly", "Evaluate medication taper readiness", "Create maintenance wellness plan", "Review early warning signs"]'::jsonb,
'pending', NOW(), NOW()),

-- HIGH: Emma Kowalski - Medication review
(demo_action_uuid('emma-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('emma-kowalski-demo'), 'high', 'Medication Review Due — Fluoxetine 60mg',
'Patient on Fluoxetine 60mg for 10 months. 6-month review overdue.',
'Patient has been on Fluoxetine 60mg for 10 months. Per guidelines, 6-month medication review was due in September. Purging episodes reduced 80% (from 5x/week to 1x/month). Schedule psychiatry coordination for comprehensive med review.',
'Medication review overdue per clinical guidelines despite good treatment response.',
96, 'Within 3 days',
'["Coordinate with prescribing psychiatrist", "Review current symptom levels", "Discuss long-term medication plan", "Document medication reconciliation"]'::jsonb,
'pending', NOW(), NOW()),

-- MEDIUM: Sophia Chen-Martinez - Academic stress
(demo_action_uuid('sophia-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('sophia-chen-martinez-demo'), 'medium', 'Academic Stress Peak — Qualifying Exams Approaching',
'Patient''s qualifying exams in March. Historical pattern shows anxiety escalation.',
'Patient''s qualifying exams are in March 2026 (approximately 4-6 weeks away). Historical pattern shows anxiety escalation 4-6 weeks before academic milestones. Proactive coping plan recommended at today''s session.',
'Anticipatory anxiety pattern detected. Proactive intervention recommended.',
82, 'Today',
'["Develop exam-specific coping plan", "Increase session frequency temporarily", "Review Buspirone effectiveness", "Stress inoculation techniques"]'::jsonb,
'pending', NOW(), NOW()),

-- MEDIUM: Robert Fitzgerald - Cognitive screening
(demo_action_uuid('robert-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('robert-fitzgerald-demo'), 'medium', 'Cognitive Screening Follow-Up Recommended',
'Patient reported mild word-finding difficulties at last 2 sessions.',
'Patient reported mild word-finding difficulties at last 2 sessions. Age 77, history of grief-related cognitive fog. Previous Mini-Cog improved from 4/5 to 5/5 as depression treated. MoCA or MMSE screening recommended to establish baseline and rule out neurocognitive disorder.',
'Age and reported cognitive symptoms warrant screening even if depression-related improvement noted.',
79, 'Next visit',
'["Administer MoCA screening", "Discuss PCP referral for neurocognitive eval", "Document cognitive observations", "Continue monitoring with depression treatment"]'::jsonb,
'pending', NOW(), NOW()),

-- MEDIUM: Aaliyah Brooks - Family session
(demo_action_uuid('aaliyah-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('aaliyah-brooks-demo'), 'medium', 'Family Session Recommended',
'Patient exploring gender identity, anxious about coming out to parents.',
'Patient has been exploring gender identity for 5 months. Reports wanting to come out to parents but anxious about their conservative/religious background. Therapeutic disclosure session could provide safe container when patient is ready.',
'Family dynamics assessment indicates potential benefit from therapeutic family session when patient ready.',
76, 'This month',
'["Explore readiness for family disclosure", "Prepare psychoeducation materials for parents", "Identify support resources (PFLAG)", "Safety plan for negative family reaction"]'::jsonb,
'pending', NOW(), NOW()),

-- MEDIUM: David Nakamura - Couples session
(demo_action_uuid('david-001'), '550e8400-e29b-41d4-a716-446655440000', demo_patient_uuid('david-nakamura-demo'), 'medium', 'Couples Session Transition',
'Patient reports wife interested in joining therapy. Relationship strain is primary concern.',
'Patient reports wife interested in joining therapy. Relationship strain is primary presenting concern. Wife scheduled to join Feb 10 session. Consider transitioning to couples format or adding conjoint sessions to address marital dynamics directly.',
'Partner engagement request with relationship-focused presenting problem suggests couples modality.',
85, 'Next visit',
'["Schedule couples intake", "Review couples therapy modalities", "Send pre-session questionnaire to spouse", "Prepare for joint session facilitation"]'::jsonb,
'pending', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CLEANUP: Drop helper functions (optional, can keep for future use)
-- ============================================================================

-- Uncomment to drop helper functions if not needed
-- DROP FUNCTION IF EXISTS demo_patient_uuid(TEXT);
-- DROP FUNCTION IF EXISTS demo_appointment_uuid(TEXT);
-- DROP FUNCTION IF EXISTS demo_outcome_uuid(TEXT);
-- DROP FUNCTION IF EXISTS demo_message_uuid(TEXT);
-- DROP FUNCTION IF EXISTS demo_invoice_uuid(TEXT);
-- DROP FUNCTION IF EXISTS demo_action_uuid(TEXT);

-- ============================================================================
-- END OF SEED DATA MIGRATION
-- ============================================================================
