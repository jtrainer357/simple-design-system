#!/usr/bin/env node
/**
 * Setup reviews table and insert demo data
 * Run with: node scripts/setup-reviews.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

const PRACTICE_ID = '550e8400-e29b-41d4-a716-446655440000';

// Reviews data
const reviews = [
  { id: '750e8400-e29b-41d4-a716-446655440001', patient_id: '550e8400-e29b-41d4-a716-446655440001', reviewer_name: 'Sarah Mitchell', review_type: 'treatment_outcome', rating: 5, title: 'Life-changing therapy experience', review_text: 'After struggling with anxiety for years, I finally found a practice that truly understands.', is_anonymous: false, review_date: '2025-12-15' },
  { id: '750e8400-e29b-41d4-a716-446655440002', patient_id: '550e8400-e29b-41d4-a716-446655440001', reviewer_name: null, review_type: 'care_quality', rating: 5, title: 'Compassionate and professional staff', review_text: 'Everyone from the front desk to my therapist makes me feel welcome.', is_anonymous: true, review_date: '2026-01-20' },
  { id: '750e8400-e29b-41d4-a716-446655440003', patient_id: '550e8400-e29b-41d4-a716-446655440002', reviewer_name: 'Marcus Johnson', review_type: 'provider_feedback', rating: 5, title: 'Dr. Chen is exceptional', review_text: 'My therapist takes the time to really listen.', is_anonymous: false, review_date: '2025-11-08' },
  { id: '750e8400-e29b-41d4-a716-446655440004', patient_id: '550e8400-e29b-41d4-a716-446655440002', reviewer_name: null, review_type: 'treatment_outcome', rating: 4, title: 'Making real progress', review_text: 'Six months in and I can see measurable improvement.', is_anonymous: true, review_date: '2026-01-28' },
  { id: '750e8400-e29b-41d4-a716-446655440005', patient_id: '550e8400-e29b-41d4-a716-446655440003', reviewer_name: 'Emily Chen', review_type: 'care_quality', rating: 5, title: 'A safe space to heal', review_text: 'This practice creates such a warm and welcoming environment.', is_anonymous: false, review_date: '2025-10-22' },
  { id: '750e8400-e29b-41d4-a716-446655440006', patient_id: '550e8400-e29b-41d4-a716-446655440003', reviewer_name: 'Emily Chen', review_type: 'treatment_outcome', rating: 5, title: 'Recovery is possible', review_text: 'I never thought I would have a healthy relationship with food again.', is_anonymous: false, review_date: '2026-01-05' },
  { id: '750e8400-e29b-41d4-a716-446655440007', patient_id: '550e8400-e29b-41d4-a716-446655440004', reviewer_name: 'David Rodriguez', review_type: 'provider_feedback', rating: 4, title: 'Helpful but scheduling can be tricky', review_text: 'My therapist is great and truly understands PTSD.', is_anonymous: false, review_date: '2025-09-14' },
  { id: '750e8400-e29b-41d4-a716-446655440008', patient_id: '550e8400-e29b-41d4-a716-446655440004', reviewer_name: null, review_type: 'treatment_outcome', rating: 5, title: 'EMDR therapy changed everything', review_text: 'The EMDR sessions have helped me process trauma I carried for decades.', is_anonymous: true, review_date: '2026-01-15' },
  { id: '750e8400-e29b-41d4-a716-446655440009', patient_id: '550e8400-e29b-41d4-a716-446655440005', reviewer_name: 'Jennifer Liu', review_type: 'general', rating: 5, title: 'Highly recommend this practice', review_text: 'From my first call to schedule an appointment, I felt cared for.', is_anonymous: false, review_date: '2025-12-03' },
  { id: '750e8400-e29b-41d4-a716-446655440010', patient_id: '550e8400-e29b-41d4-a716-446655440005', reviewer_name: null, review_type: 'care_quality', rating: 4, title: 'Good experience overall', review_text: 'The care is excellent. Very professional team.', is_anonymous: true, review_date: '2026-01-30' },
  { id: '750e8400-e29b-41d4-a716-446655440011', patient_id: '550e8400-e29b-41d4-a716-446655440006', reviewer_name: 'Robert Thompson', review_type: 'treatment_outcome', rating: 4, title: 'Steady improvement', review_text: 'The medication management here is top-notch.', is_anonymous: false, review_date: '2025-11-20' },
  { id: '750e8400-e29b-41d4-a716-446655440012', patient_id: '550e8400-e29b-41d4-a716-446655440006', reviewer_name: 'Robert Thompson', review_type: 'provider_feedback', rating: 5, title: 'Finally found the right fit', review_text: 'The collaborative approach to treatment planning is refreshing.', is_anonymous: false, review_date: '2026-01-12' },
  { id: '750e8400-e29b-41d4-a716-446655440013', patient_id: '550e8400-e29b-41d4-a716-446655440007', reviewer_name: 'Aisha Patel', review_type: 'care_quality', rating: 5, title: 'Culturally sensitive care', review_text: 'My therapist understands cultural nuances.', is_anonymous: false, review_date: '2025-10-05' },
  { id: '750e8400-e29b-41d4-a716-446655440014', patient_id: '550e8400-e29b-41d4-a716-446655440007', reviewer_name: null, review_type: 'treatment_outcome', rating: 5, title: 'Anxiety management success', review_text: 'The mindfulness techniques have given me practical tools.', is_anonymous: true, review_date: '2026-01-25' },
  { id: '750e8400-e29b-41d4-a716-446655440015', patient_id: '550e8400-e29b-41d4-a716-446655440008', reviewer_name: "James O'Brien", review_type: 'provider_feedback', rating: 4, title: 'Good therapy but waitlist was long', review_text: 'Once I got in, the care has been excellent.', is_anonymous: false, review_date: '2025-08-28' },
  { id: '750e8400-e29b-41d4-a716-446655440016', patient_id: '550e8400-e29b-41d4-a716-446655440008', reviewer_name: "James O'Brien", review_type: 'treatment_outcome', rating: 5, title: 'Back to feeling like myself', review_text: 'After a year of treatment, I finally feel like the fog has lifted.', is_anonymous: false, review_date: '2026-01-08' },
  { id: '750e8400-e29b-41d4-a716-446655440017', patient_id: '550e8400-e29b-41d4-a716-446655440009', reviewer_name: 'Maria Rossi', review_type: 'general', rating: 5, title: 'Wonderful experience', review_text: 'The entire team is dedicated to patient wellbeing.', is_anonymous: false, review_date: '2025-12-20' },
  { id: '750e8400-e29b-41d4-a716-446655440018', patient_id: '550e8400-e29b-41d4-a716-446655440009', reviewer_name: null, review_type: 'care_quality', rating: 4, title: 'Very professional practice', review_text: 'Sessions always start on time.', is_anonymous: true, review_date: '2026-01-18' },
  { id: '750e8400-e29b-41d4-a716-446655440019', patient_id: '550e8400-e29b-41d4-a716-446655440011', reviewer_name: 'Amanda Chen', review_type: 'treatment_outcome', rating: 5, title: 'Postpartum support that saved me', review_text: 'The specialized perinatal mental health support was exactly what I needed.', is_anonymous: false, review_date: '2025-09-30' },
  { id: '750e8400-e29b-41d4-a716-446655440020', patient_id: '550e8400-e29b-41d4-a716-446655440011', reviewer_name: 'Amanda Chen', review_type: 'provider_feedback', rating: 5, title: 'Compassionate and knowledgeable', review_text: 'My provider stayed late once when I was in crisis.', is_anonymous: false, review_date: '2026-01-22' },
  { id: '750e8400-e29b-41d4-a716-446655440021', patient_id: '550e8400-e29b-41d4-a716-446655440012', reviewer_name: 'Christopher Murphy', review_type: 'care_quality', rating: 4, title: 'Solid OCD treatment', review_text: 'The ERP therapy has been challenging but effective.', is_anonymous: false, review_date: '2025-11-15' },
  { id: '750e8400-e29b-41d4-a716-446655440022', patient_id: '550e8400-e29b-41d4-a716-446655440012', reviewer_name: null, review_type: 'treatment_outcome', rating: 4, title: 'Progress takes time but it works', review_text: 'My OCD symptoms have decreased significantly.', is_anonymous: true, review_date: '2026-01-31' },
  { id: '750e8400-e29b-41d4-a716-446655440023', patient_id: '550e8400-e29b-41d4-a716-446655440013', reviewer_name: 'Nicole Kowalski', review_type: 'provider_feedback', rating: 5, title: 'Best therapist I have ever had', review_text: 'My therapist has a gift for making complex emotions understandable.', is_anonymous: false, review_date: '2025-10-12' },
  { id: '750e8400-e29b-41d4-a716-446655440024', patient_id: '550e8400-e29b-41d4-a716-446655440013', reviewer_name: 'Nicole Kowalski', review_type: 'general', rating: 5, title: 'Highly recommend for grief counseling', review_text: 'If you are dealing with loss, this is the place to go.', is_anonymous: false, review_date: '2026-01-10' },
  { id: '750e8400-e29b-41d4-a716-446655440025', patient_id: '550e8400-e29b-41d4-a716-446655440014', reviewer_name: 'Steven Nakamura', review_type: 'treatment_outcome', rating: 4, title: 'Managing social anxiety better', review_text: 'I can now attend social events without severe panic.', is_anonymous: false, review_date: '2025-12-08' },
  { id: '750e8400-e29b-41d4-a716-446655440026', patient_id: '550e8400-e29b-41d4-a716-446655440014', reviewer_name: null, review_type: 'care_quality', rating: 5, title: 'Comfortable and private setting', review_text: 'The office design clearly considers patient comfort.', is_anonymous: true, review_date: '2026-01-27' },
  { id: '750e8400-e29b-41d4-a716-446655440027', patient_id: '550e8400-e29b-41d4-a716-446655440015', reviewer_name: 'Jessica Martinez', review_type: 'provider_feedback', rating: 5, title: 'Trauma-informed care at its best', review_text: 'The entire practice operates with trauma-informed principles.', is_anonymous: false, review_date: '2025-09-20' },
  { id: '750e8400-e29b-41d4-a716-446655440028', patient_id: '550e8400-e29b-41d4-a716-446655440015', reviewer_name: 'Jessica Martinez', review_type: 'treatment_outcome', rating: 5, title: 'PTSD symptoms significantly reduced', review_text: 'After years of suffering, I finally have hope.', is_anonymous: false, review_date: '2026-01-03' },
  { id: '750e8400-e29b-41d4-a716-446655440029', patient_id: '550e8400-e29b-41d4-a716-446655440018', reviewer_name: 'Kevin Goldstein', review_type: 'care_quality', rating: 4, title: 'Good ADHD management', review_text: 'The psychiatrist really understands adult ADHD.', is_anonymous: false, review_date: '2025-11-25' },
  { id: '750e8400-e29b-41d4-a716-446655440030', patient_id: '550e8400-e29b-41d4-a716-446655440018', reviewer_name: null, review_type: 'treatment_outcome', rating: 5, title: 'Finally functioning at work', review_text: 'The combination of medication and coaching has transformed my work.', is_anonymous: true, review_date: '2026-01-14' },
  { id: '750e8400-e29b-41d4-a716-446655440031', patient_id: '550e8400-e29b-41d4-a716-446655440019', reviewer_name: 'Rachel Thompson', review_type: 'general', rating: 5, title: 'Excellent couples therapy', review_text: 'My partner and I are stronger than ever now.', is_anonymous: false, review_date: '2025-10-30' },
  { id: '750e8400-e29b-41d4-a716-446655440032', patient_id: '550e8400-e29b-41d4-a716-446655440019', reviewer_name: 'Rachel Thompson', review_type: 'provider_feedback', rating: 5, title: 'Therapist is insightful and balanced', review_text: 'Our couples therapist never takes sides.', is_anonymous: false, review_date: '2026-01-19' },
  { id: '750e8400-e29b-41d4-a716-446655440033', patient_id: '550e8400-e29b-41d4-a716-446655440020', reviewer_name: 'Brian Anton', review_type: 'treatment_outcome', rating: 4, title: 'Substance abuse recovery support', review_text: 'The addiction counseling has been crucial to my recovery.', is_anonymous: false, review_date: '2025-08-15' },
  { id: '750e8400-e29b-41d4-a716-446655440034', patient_id: '550e8400-e29b-41d4-a716-446655440020', reviewer_name: null, review_type: 'care_quality', rating: 5, title: 'Supportive recovery environment', review_text: 'The practice understands addiction as a health issue.', is_anonymous: true, review_date: '2025-12-28' },
  { id: '750e8400-e29b-41d4-a716-446655440035', patient_id: '550e8400-e29b-41d4-a716-446655440021', reviewer_name: 'Stephanie Park', review_type: 'provider_feedback', rating: 5, title: 'Understanding and patient therapist', review_text: 'My therapist never rushes sessions.', is_anonymous: false, review_date: '2025-11-02' },
  { id: '750e8400-e29b-41d4-a716-446655440036', patient_id: '550e8400-e29b-41d4-a716-446655440021', reviewer_name: 'Stephanie Park', review_type: 'treatment_outcome', rating: 4, title: 'Slowly emerging from depression', review_text: 'It is a journey, but I am finally seeing light.', is_anonymous: false, review_date: '2026-01-24' },
  { id: '750e8400-e29b-41d4-a716-446655440037', patient_id: '550e8400-e29b-41d4-a716-446655440023', reviewer_name: 'Megan Sullivan', review_type: 'care_quality', rating: 5, title: 'Teen-friendly environment', review_text: 'The therapists know how to connect with young people.', is_anonymous: false, review_date: '2025-09-08' },
  { id: '750e8400-e29b-41d4-a716-446655440038', patient_id: '550e8400-e29b-41d4-a716-446655440023', reviewer_name: 'Megan Sullivan', review_type: 'general', rating: 5, title: 'Great for family therapy too', review_text: 'The coordination between providers was seamless.', is_anonymous: false, review_date: '2026-01-06' },
  { id: '750e8400-e29b-41d4-a716-446655440039', patient_id: '550e8400-e29b-41d4-a716-446655440024', reviewer_name: 'Anthony Benedetti', review_type: 'treatment_outcome', rating: 4, title: 'Anger management progress', review_text: 'Learning to manage my anger has improved every relationship.', is_anonymous: false, review_date: '2025-12-12' },
  { id: '750e8400-e29b-41d4-a716-446655440040', patient_id: '550e8400-e29b-41d4-a716-446655440024', reviewer_name: null, review_type: 'provider_feedback', rating: 5, title: 'Therapist challenged me constructively', review_text: 'It has led to real change.', is_anonymous: true, review_date: '2026-01-29' },
  { id: '750e8400-e29b-41d4-a716-446655440041', patient_id: '550e8400-e29b-41d4-a716-446655440025', reviewer_name: 'Heather Donovan', review_type: 'care_quality', rating: 5, title: 'Flexible telehealth options', review_text: 'As a busy mom, the telehealth option has been a lifesaver.', is_anonymous: false, review_date: '2025-10-18' },
  { id: '750e8400-e29b-41d4-a716-446655440042', patient_id: '550e8400-e29b-41d4-a716-446655440025', reviewer_name: 'Heather Donovan', review_type: 'treatment_outcome', rating: 4, title: 'Anxiety much more manageable', review_text: 'Now I have tools to cope.', is_anonymous: false, review_date: '2026-01-16' },
  { id: '750e8400-e29b-41d4-a716-446655440043', patient_id: '550e8400-e29b-41d4-a716-446655440026', reviewer_name: 'Ryan Campanelli', review_type: 'provider_feedback', rating: 3, title: 'Good care but communication could improve', review_text: 'Clinical care is five stars though.', is_anonymous: false, review_date: '2025-11-28' },
  { id: '750e8400-e29b-41d4-a716-446655440044', patient_id: '550e8400-e29b-41d4-a716-446655440026', reviewer_name: 'Ryan Campanelli', review_type: 'treatment_outcome', rating: 5, title: 'Work stress finally under control', review_text: 'The stress management strategies have been transformative.', is_anonymous: false, review_date: '2026-01-21' },
  { id: '750e8400-e29b-41d4-a716-446655440045', patient_id: '550e8400-e29b-41d4-a716-446655440027', reviewer_name: 'Olivia McCarthy', review_type: 'general', rating: 5, title: 'Helped me through a major life transition', review_text: 'Having a supportive therapist made all the difference.', is_anonymous: false, review_date: '2025-08-22' },
  { id: '750e8400-e29b-41d4-a716-446655440046', patient_id: '550e8400-e29b-41d4-a716-446655440027', reviewer_name: null, review_type: 'care_quality', rating: 5, title: 'Privacy and discretion appreciated', review_text: 'This practice takes privacy seriously.', is_anonymous: true, review_date: '2025-12-05' },
  { id: '750e8400-e29b-41d4-a716-446655440047', patient_id: '550e8400-e29b-41d4-a716-446655440027', reviewer_name: 'Olivia McCarthy', review_type: 'treatment_outcome', rating: 5, title: 'Ready for the next chapter', review_text: 'A year of therapy later and I am actually excited about my future.', is_anonymous: false, review_date: '2026-02-01' },
];

// Add practice_id to all reviews
const reviewsWithPractice = reviews.map(r => ({
  ...r,
  practice_id: PRACTICE_ID
}));

async function insertReviews() {
  const url = `${SUPABASE_URL}/rest/v1/reviews`;

  console.log('Inserting 47 reviews into Supabase...\n');

  const postData = JSON.stringify(reviewsWithPractice);

  const urlObj = new URL(url);

  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Successfully inserted ${reviews.length} reviews!`);
          resolve(true);
        } else {
          console.log(`❌ Failed with status ${res.statusCode}`);
          console.log(`Response: ${data}`);

          if (data.includes('relation "reviews" does not exist')) {
            console.log('\n⚠️  The reviews table does not exist yet.');
            console.log('Please run the CREATE TABLE SQL in Supabase Dashboard first.\n');
          }
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ Error: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

insertReviews();
