-- ============================================================================
-- MHMVP DEMO DATA SEED SCRIPT
-- Dr. Jennifer Martinez, PsyD - Mount Lebanon, PA
-- Demo Date: Friday, February 6, 2026
-- ============================================================================
-- This script populates the MHMVP database with 23 curated patients,
-- 89 appointments, 66 communications, 98 invoices, 10 priority actions,
-- and 26 visit summaries for a flawless, repeatable hackathon demo.
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
-- STEP 7.5: Load demo visit summaries
-- ============================================================================
DELETE FROM visit_summaries WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

\COPY visit_summaries(id, practice_id, patient_id, clinical_note_id, visit_date, patient_name, appointment_type, visit_summary, created_at)
FROM '/tmp/demo_visit_summaries.csv'
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
),
-- Top 6 alphabetical patients - ensuring all have priority actions
(
  '850e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440020',
  'Recovery Milestone - 9 Year Sobriety Check-in',
  'MEDIUM',
  'This week',
  91,
  'Brian Anton, 61M. Substance Use Disorder in sustained remission (9 years sober). Annual sobriety milestone approaching. Strong recovery foundation but recent work stress noted. Maintenance support indicated.',
  '["Acknowledge 9-year sobriety milestone in session", "Review relapse prevention plan", "Assess current stress coping strategies", "Connect with sponsor/support network"]'::jsonb,
  'Brian Anton',
  61,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440024',
  'DBT Skills Consolidation Due',
  'HIGH',
  'Within 3 days',
  89,
  'Anthony Benedetti, 54M. Borderline traits with anger dysregulation. Recent DBT module completed. Skills practice showing improvement but needs consolidation. Interpersonal effectiveness focus recommended.',
  '["Review DBT TIPP skills application", "Assess interpersonal conflict patterns", "Schedule skills group continuation", "Reinforce distress tolerance techniques"]'::jsonb,
  'Anthony Benedetti',
  54,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440025',
  'Telehealth Follow-up - GAD Assessment',
  'HIGH',
  'Today',
  92,
  'Heather Donovan, 36F. Generalized Anxiety Disorder with parenting stress. Recent telehealth sessions showing good engagement. GAD-7 score trending down (14→11). Continue momentum with coping skills.',
  '["Complete GAD-7 reassessment", "Review work-life balance strategies", "Assess sleep hygiene progress", "Plan anxiety management for upcoming school events"]'::jsonb,
  'Heather Donovan',
  36,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440018',
  'ADHD Medication Review Needed',
  'HIGH',
  'Within 3 days',
  95,
  'Kevin Goldstein, 50M. Adult ADHD on stimulant therapy. Quarterly medication review due. Patient reports improved focus at work. Side effect monitoring indicated.',
  '["Complete stimulant medication review", "Assess cardiovascular monitoring (BP, HR)", "Review work performance improvements", "Discuss medication timing optimization"]'::jsonb,
  'Kevin Goldstein',
  50,
  now()
),
(
  '850e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440013',
  'Grief Processing - Anniversary Approaching',
  'HIGH',
  'This week',
  87,
  'Nicole Kowalski, 30F. Complicated grief following father''s death (18 months). Anniversary of loss approaching Feb 15. Increased support and proactive outreach indicated.',
  '["Schedule pre-anniversary support session", "Review coping strategies for anniversary", "Assess current grief stage and functioning", "Connect with grief support resources"]'::jsonb,
  'Nicole Kowalski',
  30,
  now()
);

-- ============================================================================
-- VERIFICATION (mid-load)
-- ============================================================================
SELECT
  (SELECT COUNT(*) FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as patient_count,
  (SELECT COUNT(*) FROM appointments WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as appointment_count,
  (SELECT COUNT(*) FROM medications WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as medication_count,
  (SELECT COUNT(*) FROM outcome_measures WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as outcome_count,
  (SELECT COUNT(*) FROM communications WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as communication_count,
  (SELECT COUNT(*) FROM invoices WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as invoice_count,
  (SELECT COUNT(*) FROM visit_summaries WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as visit_summary_count,
  (SELECT COUNT(*) FROM prioritized_actions WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as priority_action_count;

-- ============================================================================
-- STEP 9: Load demo reviews
-- ============================================================================
DELETE FROM reviews WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000';

INSERT INTO reviews (id, practice_id, patient_id, reviewer_name, review_type, rating, title, review_text, is_anonymous, review_date, created_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Mitchell', 'treatment_outcome', 5, 'Life-changing therapy experience', 'After struggling with anxiety for years, I finally found a practice that truly understands. The cognitive behavioral therapy approach has given me tools I use daily. I can now manage my panic attacks and feel more in control of my life.', false, '2025-12-15', '2025-12-15T14:30:00Z'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', NULL, 'care_quality', 5, 'Compassionate and professional staff', 'Everyone from the front desk to my therapist makes me feel welcome and understood. The scheduling is flexible and they always accommodate my needs.', true, '2026-01-20', '2026-01-20T09:15:00Z'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Marcus Johnson', 'provider_feedback', 5, 'Dr. Chen is exceptional', 'My therapist takes the time to really listen and provides thoughtful guidance. The depression I''ve battled for years finally feels manageable. I look forward to my sessions.', false, '2025-11-08', '2025-11-08T16:45:00Z'),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', NULL, 'treatment_outcome', 4, 'Making real progress', 'Six months in and I can see measurable improvement in my mood and daily functioning. The combination of therapy and medication management has been effective.', true, '2026-01-28', '2026-01-28T11:20:00Z'),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Emily Chen', 'care_quality', 5, 'A safe space to heal', 'This practice creates such a warm and welcoming environment. I never feel judged for my struggles with eating disorder recovery. The holistic approach addresses both mind and body.', false, '2025-10-22', '2025-10-22T13:00:00Z'),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Emily Chen', 'treatment_outcome', 5, 'Recovery is possible', 'I never thought I''d have a healthy relationship with food again. The specialized treatment and group therapy options have transformed my life.', false, '2026-01-05', '2026-01-05T10:30:00Z'),
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', 'David Rodriguez', 'provider_feedback', 4, 'Helpful but scheduling can be tricky', 'My therapist is great and truly understands PTSD. The only challenge is getting appointments that work with my schedule. Otherwise excellent care.', false, '2025-09-14', '2025-09-14T15:45:00Z'),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004', NULL, 'treatment_outcome', 5, 'EMDR therapy changed everything', 'The EMDR sessions have helped me process trauma I carried for decades. I sleep better and the flashbacks have significantly decreased.', true, '2026-01-15', '2026-01-15T08:00:00Z'),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', 'Jennifer Liu', 'general', 5, 'Highly recommend this practice', 'From my first call to schedule an appointment, I felt cared for. The intake process was thorough but not overwhelming. My anxiety is finally under control.', false, '2025-12-03', '2025-12-03T14:15:00Z'),
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005', NULL, 'care_quality', 4, 'Good experience overall', 'The care is excellent. The office could use some updates but the quality of therapy more than makes up for it. Very professional team.', true, '2026-01-30', '2026-01-30T17:30:00Z'),
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', 'Robert Thompson', 'treatment_outcome', 4, 'Steady improvement', 'Dealing with bipolar disorder is challenging, but the medication management here is top-notch. My moods are more stable than they''ve been in years.', false, '2025-11-20', '2025-11-20T12:00:00Z'),
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006', 'Robert Thompson', 'provider_feedback', 5, 'Finally found the right fit', 'After trying several practices, I finally found providers who take the time to understand my unique situation. The collaborative approach to treatment planning is refreshing.', false, '2026-01-12', '2026-01-12T09:45:00Z'),
('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440007', 'Aisha Patel', 'care_quality', 5, 'Culturally sensitive care', 'As someone from a South Asian background, I appreciate that my therapist understands cultural nuances. They never make assumptions and create a truly inclusive space.', false, '2025-10-05', '2025-10-05T11:30:00Z'),
('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440007', NULL, 'treatment_outcome', 5, 'Anxiety management success', 'The mindfulness techniques and CBT strategies have given me practical tools for managing anxiety. I feel equipped to handle stressful situations now.', true, '2026-01-25', '2026-01-25T16:00:00Z'),
('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', 'James O''Brien', 'provider_feedback', 4, 'Good therapy but waitlist was long', 'Once I got in, the care has been excellent. My only complaint is the initial waitlist was quite long. Worth the wait though for quality depression treatment.', false, '2025-08-28', '2025-08-28T14:00:00Z'),
('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440008', 'James O''Brien', 'treatment_outcome', 5, 'Back to feeling like myself', 'After a year of treatment, I finally feel like the fog has lifted. The combination of talk therapy and medication has been incredibly effective.', false, '2026-01-08', '2026-01-08T10:15:00Z'),
('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440009', 'Maria Rossi', 'general', 5, 'Wonderful experience from start to finish', 'The entire team is dedicated to patient wellbeing. From the calming office environment to the skilled therapists, everything shows they care about mental health.', false, '2025-12-20', '2025-12-20T13:45:00Z'),
('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440009', NULL, 'care_quality', 4, 'Very professional practice', 'Appreciate the privacy and professionalism. Sessions always start on time and my therapist is well-prepared. Minor billing confusion once but quickly resolved.', true, '2026-01-18', '2026-01-18T08:30:00Z'),
('750e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'Amanda Chen', 'treatment_outcome', 5, 'Postpartum support that saved me', 'The specialized perinatal mental health support was exactly what I needed. My therapist understood the unique challenges of new motherhood and helped me through a dark time.', false, '2025-09-30', '2025-09-30T15:00:00Z'),
('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440011', 'Amanda Chen', 'provider_feedback', 5, 'Compassionate and knowledgeable', 'My provider stayed late once when I was in crisis. That level of care and dedication is rare. Forever grateful for this practice.', false, '2026-01-22', '2026-01-22T11:00:00Z'),
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', 'Christopher Murphy', 'care_quality', 4, 'Solid OCD treatment', 'The ERP therapy has been challenging but effective. My therapist pushes me appropriately while being supportive. Seeing real reduction in compulsive behaviors.', false, '2025-11-15', '2025-11-15T09:30:00Z'),
('750e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440012', NULL, 'treatment_outcome', 4, 'Progress takes time but it works', 'Eight months of treatment and my OCD symptoms have decreased significantly. The practice takes a methodical, evidence-based approach that I appreciate.', true, '2026-01-31', '2026-01-31T14:45:00Z'),
('750e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013', 'Nicole Kowalski', 'provider_feedback', 5, 'Best therapist I have ever had', 'My therapist has a gift for making complex emotions understandable. The grief counseling after losing my father has helped me process in healthy ways.', false, '2025-10-12', '2025-10-12T16:30:00Z'),
('750e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440013', 'Nicole Kowalski', 'general', 5, 'Highly recommend for grief counseling', 'If you are dealing with loss, this is the place to go. The compassionate care helped me navigate the most difficult time of my life.', false, '2026-01-10', '2026-01-10T12:15:00Z'),
('750e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440014', 'Steven Nakamura', 'treatment_outcome', 4, 'Managing social anxiety better', 'Still a work in progress, but I can now attend social events without severe panic. The gradual exposure therapy approach has been helpful.', false, '2025-12-08', '2025-12-08T10:00:00Z'),
('750e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440014', NULL, 'care_quality', 5, 'Comfortable and private setting', 'The office design clearly considers patient comfort. Private waiting areas and soundproofed rooms make discussing sensitive topics easier.', true, '2026-01-27', '2026-01-27T15:30:00Z'),
('750e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440015', 'Jessica Martinez', 'provider_feedback', 5, 'Trauma-informed care at its best', 'The entire practice operates with trauma-informed principles. I never feel triggered by the environment or interactions. Truly healing space.', false, '2025-09-20', '2025-09-20T13:00:00Z'),
('750e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440015', 'Jessica Martinez', 'treatment_outcome', 5, 'PTSD symptoms significantly reduced', 'After years of suffering, I finally have hope. The specialized trauma therapy has reduced my nightmares and hypervigilance dramatically.', false, '2026-01-03', '2026-01-03T09:00:00Z'),
('750e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440018', 'Kevin Goldstein', 'care_quality', 4, 'Good ADHD management', 'The psychiatrist really understands adult ADHD. Medication adjustments have been careful and thoughtful. Would appreciate more frequent check-ins.', false, '2025-11-25', '2025-11-25T11:45:00Z'),
('750e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440018', NULL, 'treatment_outcome', 5, 'Finally functioning at work', 'The combination of medication and coaching strategies has transformed my work performance. I can focus and complete projects now.', true, '2026-01-14', '2026-01-14T14:00:00Z'),
('750e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440019', 'Rachel Thompson', 'general', 5, 'Excellent couples therapy', 'My partner and I were on the verge of divorce. The couples counseling gave us tools to communicate and reconnect. We are stronger than ever now.', false, '2025-10-30', '2025-10-30T17:00:00Z'),
('750e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440019', 'Rachel Thompson', 'provider_feedback', 5, 'Therapist is insightful and balanced', 'Our couples therapist never takes sides and helps us both feel heard. The relationship has improved dramatically in just a few months.', false, '2026-01-19', '2026-01-19T10:30:00Z'),
('750e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', 'Brian Anton', 'treatment_outcome', 4, 'Substance abuse recovery support', 'The addiction counseling has been crucial to my recovery. Appreciate the non-judgmental approach and practical relapse prevention strategies.', false, '2025-08-15', '2025-08-15T12:30:00Z'),
('750e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440020', NULL, 'care_quality', 5, 'Supportive recovery environment', 'The practice understands addiction as a health issue not a moral failing. That perspective made all the difference in my willingness to engage.', true, '2025-12-28', '2025-12-28T15:15:00Z'),
('750e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', 'Stephanie Park', 'provider_feedback', 5, 'Understanding and patient therapist', 'My therapist never rushes sessions and always makes sure I feel heard. The treatment for my depression has been gentle but effective.', false, '2025-11-02', '2025-11-02T14:30:00Z'),
('750e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440021', 'Stephanie Park', 'treatment_outcome', 4, 'Slowly emerging from depression', 'It is a journey, but I am finally seeing light. The combination approach of therapy and lifestyle changes is working. Grateful for patient guidance.', false, '2026-01-24', '2026-01-24T09:45:00Z'),
('750e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440023', 'Megan Sullivan', 'care_quality', 5, 'Teen-friendly environment', 'Brought my teenage daughter here and she actually wants to go to therapy now. The therapists know how to connect with young people without being condescending.', false, '2025-09-08', '2025-09-08T16:00:00Z'),
('750e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440023', 'Megan Sullivan', 'general', 5, 'Great for family therapy too', 'We did both individual and family sessions. The coordination between providers was seamless and everyone was on the same page.', false, '2026-01-06', '2026-01-06T11:15:00Z'),
('750e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440024', 'Anthony Benedetti', 'treatment_outcome', 4, 'Anger management progress', 'Learning to manage my anger has improved every relationship in my life. The DBT skills are practical and I use them daily.', false, '2025-12-12', '2025-12-12T13:30:00Z'),
('750e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440024', NULL, 'provider_feedback', 5, 'Therapist challenged me constructively', 'I needed someone who would call me out on my patterns. My therapist does this respectfully and it has led to real change.', true, '2026-01-29', '2026-01-29T10:00:00Z'),
('750e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440025', 'Heather Donovan', 'care_quality', 5, 'Flexible telehealth options', 'As a busy mom, the telehealth option has been a lifesaver. Same quality care from the comfort of home. Technology works smoothly.', false, '2025-10-18', '2025-10-18T20:00:00Z'),
('750e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440025', 'Heather Donovan', 'treatment_outcome', 4, 'Anxiety much more manageable', 'Still have anxious moments but now I have tools to cope. The practice taught me that managing anxiety is a skill that improves with practice.', false, '2026-01-16', '2026-01-16T19:30:00Z'),
('750e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440026', 'Ryan Campanelli', 'provider_feedback', 3, 'Good care but communication could improve', 'The therapy itself is excellent. I wish the office was better about returning calls and confirming appointments. Clinical care is five stars though.', false, '2025-11-28', '2025-11-28T11:00:00Z'),
('750e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440026', 'Ryan Campanelli', 'treatment_outcome', 5, 'Work stress finally under control', 'Burnout was destroying my health and relationships. The stress management strategies and boundary-setting work has been transformative.', false, '2026-01-21', '2026-01-21T14:15:00Z'),
('750e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440027', 'Olivia McCarthy', 'general', 5, 'Helped me through a major life transition', 'Divorce is hard. Having a supportive therapist made all the difference. I processed my grief and emerged stronger and more self-aware.', false, '2025-08-22', '2025-08-22T15:45:00Z'),
('750e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440027', NULL, 'care_quality', 5, 'Privacy and discretion appreciated', 'Going through a public divorce, I needed absolute confidentiality. This practice takes privacy seriously and I always felt my information was protected.', true, '2025-12-05', '2025-12-05T12:00:00Z'),
('750e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440027', 'Olivia McCarthy', 'treatment_outcome', 5, 'Ready for the next chapter', 'A year of therapy later and I am actually excited about my future. Learned so much about myself and what I want in life. Highly recommend.', false, '2026-02-01', '2026-02-01T10:00:00Z');

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================
SELECT
  (SELECT COUNT(*) FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as patient_count,
  (SELECT COUNT(*) FROM appointments WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as appointment_count,
  (SELECT COUNT(*) FROM medications WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as medication_count,
  (SELECT COUNT(*) FROM outcome_measures WHERE patient_id IN (SELECT id FROM patients WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000')) as outcome_count,
  (SELECT COUNT(*) FROM communications WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as communication_count,
  (SELECT COUNT(*) FROM invoices WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as invoice_count,
  (SELECT COUNT(*) FROM visit_summaries WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as visit_summary_count,
  (SELECT COUNT(*) FROM prioritized_actions WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as priority_action_count,
  (SELECT COUNT(*) FROM reviews WHERE practice_id = '550e8400-e29b-41d4-a716-446655440000') as review_count;

-- ============================================================================
-- Demo data loaded successfully!
-- System Date: Friday, February 6, 2026
-- ============================================================================
