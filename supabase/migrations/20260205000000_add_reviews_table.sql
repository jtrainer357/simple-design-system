-- Mental Health MVP - Reviews Table
-- Created: 2026-02-05
-- This migration adds the reviews table for patient feedback and ratings

-- ============================================
-- REVIEWS (Patient Feedback & Ratings)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  -- Reviewer info (null if anonymous)
  reviewer_name TEXT,
  -- Review details
  review_type TEXT NOT NULL CHECK (review_type IN ('treatment_outcome', 'care_quality', 'provider_feedback', 'general')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  review_text TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  -- Dates
  review_date DATE NOT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_reviews_practice ON reviews(practice_id);
CREATE INDEX idx_reviews_patient ON reviews(patient_id);
CREATE INDEX idx_reviews_type ON reviews(review_type);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_date ON reviews(review_date);
CREATE INDEX idx_reviews_practice_date ON reviews(practice_id, review_date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Demo policy: Allow all operations (FOR HACKATHON ONLY)
-- In production, these would be locked down by user/practice
CREATE POLICY "demo_reviews_all" ON reviews FOR ALL USING (true) WITH CHECK (true);
