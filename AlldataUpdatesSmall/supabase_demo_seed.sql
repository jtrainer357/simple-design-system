-- ============================================================================
-- MHMVP DEMO DATA SEED SCRIPT
-- Dr. Jennifer Martinez, PsyD - Mount Lebanon, PA
-- Demo Date: Friday, February 6, 2026
-- ============================================================================
-- This script populates the MHMVP database with 23 curated patients,
-- 89 appointments, 66 communications, 98 invoices, and 5 priority actions
-- for a flawless, repeatable hackathon demo.
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure practice record exists
-- ============================================================================
INSERT INTO practices (id, name, address, city, state, zip_code, phone, email, owner_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Dr. Jennifer Martinez, PsyD',
  '100 Medical Plaza Drive, Suite 200',
  'Mount Lebanon',
  'PA',
  '15228',
  '(412) 555-0100',
  'dr.martinez@martineztherapy.com',
  'Dr. Jennifer Martinez',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Load demo patients (truncate existing, then insert)
-- ============================================================================
DELETE FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

\COPY patients(id, practice_id, first_name, last_name, date_of_birth, phone, email, address, city, state, zip_code, insurance_provider, insurance_id, status, preferred_contact, created_at, updated_at) 
FROM '/tmp/demo_patients.csv' 
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

-- ============================================================================
-- STEP 3: Load demo appointments
-- ============================================================================
DELETE FROM appointments WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

\COPY appointments(id, practice_id, patient_id, appointment_date, appointment_time, duration_minutes, appointment_type, status, cpt_code, location, notes, created_at, updated_at)
FROM '/tmp/demo_appointments.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

-- ============================================================================
-- STEP 4: Load demo medications
-- ============================================================================
DELETE FROM medications WHERE patient_id IN (
  SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000'
);

\COPY medications(id, patient_id, medication_name, dosage, frequency, prescribing_provider, prescribing_provider_phone, start_date, end_date, refill_due_date, status, notes, created_at)
FROM '/tmp/demo_medications.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

-- ============================================================================
-- STEP 5: Load demo outcome measures
-- ============================================================================
DELETE FROM outcome_measures WHERE patient_id IN (
  SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000'
);

\COPY outcome_measures(id, patient_id, measure_type, score, date_administered, administered_by, notes, created_at)
FROM '/tmp/demo_outcome_measures.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

-- ============================================================================
-- STEP 6: Load demo communications
-- ============================================================================
DELETE FROM communications WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

\COPY communications(id, practice_id, patient_id, channel, direction, sender, recipient, sender_email, recipient_email, sender_phone, recipient_phone, message_body, is_read, sent_at, created_at)
FROM '/tmp/demo_communications.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

-- ============================================================================
-- STEP 7: Load demo invoices
-- ============================================================================
DELETE FROM invoices WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

\COPY invoices(id, practice_id, patient_id, patient_name, invoice_number, invoice_date, service_date_start, service_date_end, cpt_code, description, units, unit_price, subtotal, insurance_paid, patient_responsibility, total_due, amount_paid, balance, status, insurance_provider, insurance_id, created_at)
FROM '/tmp/demo_invoices.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"', ESCAPE '"');

-- ============================================================================
-- STEP 8: Seed prioritized actions
-- ============================================================================
DELETE FROM prioritized_actions WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

INSERT INTO prioritized_actions (
  id, practice_id, patient_id, title, urgency, time_window, ai_confidence,
  clinical_context, suggested_actions, patient_name, patient_age, created_at
) VALUES
(
  '850e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'Elevated A1C Levels Detected',
  'URGENT',
  'Immediate',
  94,
  'Recent PCP appointment revealed A1C 7.8% (pre-diabetes). Depression now well-controlled with Sertraline. Opportunity for integrated behavioral intervention.',
  '["Order dietitian referral for diabetes prevention", "Schedule exercise counseling session", "Send diabetes prevention education material", "Schedule follow-up A1C in 3 months"]'::jsonb,
  'Sarah Mitchell',
  38,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440002',
  'Medication Refill Due',
  'HIGH',
  'Within 3 days',
  98,
  'Escitalopram 10mg refill expires Feb 8, 2026 (4 days). Patient stable on current dose with good GAD response. Supply 4 days remaining.',
  '["Contact Dr. Michael Rodriguez for refill authorization", "Notify patient of refill status", "Confirm pharmacy coordination"]'::jsonb,
  'Marcus Johnson',
  29,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440003',
  'First Appointment Tomorrow',
  'HIGH',
  'Immediate',
  100,
  'New patient intake (Emily Chen, 25F). Adjustment disorder with anxiety following recent job loss. Intake paperwork completed. First session scheduled Feb 6, 2026 at 2:00 PM.',
  '["Review intake paperwork and safety assessment", "Prepare initial assessment protocol", "Confirm appointment reminder sent", "Have crisis resources available"]'::jsonb,
  'Emily Chen',
  25,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440004',
  'Comorbid Depression Detected + SI Present',
  'URGENT',
  'Immediate',
  96,
  'David Rodriguez, 42M. Chronic PTSD (17-month treatment, stable PCL-5=47) + NEW major depressive disorder (PHQ-9=9, mild). Passive SI 2-3x/week. Recent weight loss, anhedonia, increased isolation. Critical clinical escalation.',
  '["Initiate antidepressant medication (coordinate with PCP)", "Increase session frequency to weekly", "Comprehensive safety assessment and planning", "Family involvement and support coordination", "Connect to crisis line information"]'::jsonb,
  'David Rodriguez',
  42,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440006',
  'Exposure Therapy Success - Reinforce',
  'MEDIUM',
  'This week',
  88,
  'Aisha Patel, 31F. Social Anxiety Disorder improving (GAD-7 17→13). Recent behavioral wins: attended work networking event, company holiday party, initiating conversations. Excellent progress on exposure work.',
  '["Celebrate progress in next session", "Discuss skill generalization to other situations", "Plan next exposure hierarchy steps", "Reinforce self-efficacy building"]'::jsonb,
  'Aisha Patel',
  31,
  now()
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 
  (SELECT COUNT(*) FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as patient_count,
  (SELECT COUNT(*) FROM appointments WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as appointment_count,
  (SELECT COUNT(*) FROM medications WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as medication_count,
  (SELECT COUNT(*) FROM outcome_measures WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as outcome_count,
  (SELECT COUNT(*) FROM communications WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as communication_count,
  (SELECT COUNT(*) FROM invoices WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as invoice_count,
  (SELECT COUNT(*) FROM prioritized_actions WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as priority_action_count;

-- ============================================================================
-- Demo data loaded successfully!
-- System Date: Friday, February 6, 2026
-- ============================================================================
