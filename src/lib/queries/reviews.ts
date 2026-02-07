/**
 * Reviews Queries
 * Fetches review data from Supabase
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import type { Review } from "@/src/lib/supabase/types";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";

const log = createLogger("queries/reviews");

/**
 * Get all reviews for a specific patient
 * @param patientId - The patient's UUID
 * @param practiceId - The practice ID for tenant scoping (defaults to demo practice)
 */
export async function getPatientReviews(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("patient_id", patientId)
    .eq("practice_id", practiceId)
    .order("review_date", { ascending: false });

  if (error) {
    log.error("Failed to fetch patient reviews", error, { action: "getPatientReviews", patientId });
    throw error;
  }

  return data || [];
}

/**
 * Get all reviews for a practice
 */
export async function getReviewsByPractice(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("practice_id", practiceId)
    .order("review_date", { ascending: false });

  if (error) {
    log.error("Failed to fetch practice reviews", error, {
      action: "getReviewsByPractice",
      practiceId,
    });
    throw error;
  }

  return data || [];
}

/**
 * Get reviews by type for a practice
 */
export async function getReviewsByType(
  reviewType: Review["review_type"],
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("practice_id", practiceId)
    .eq("review_type", reviewType)
    .order("review_date", { ascending: false });

  if (error) {
    log.error("Failed to fetch reviews by type", error, {
      action: "getReviewsByType",
      practiceId,
      reviewType,
    });
    throw error;
  }

  return data || [];
}

/**
 * Get average rating for a practice
 */
export async function getPracticeAverageRating(
  practiceId: string = DEMO_PRACTICE_ID
): Promise<number | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("practice_id", practiceId);

  if (error) {
    log.error("Failed to fetch practice ratings", error, {
      action: "getPracticeAverageRating",
      practiceId,
    });
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const sum = data.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0);
  return sum / data.length;
}

/**
 * Get recent reviews for a practice (last N reviews)
 */
export async function getRecentReviews(
  limit: number = 10,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<Review[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("practice_id", practiceId)
    .order("review_date", { ascending: false })
    .limit(limit);

  if (error) {
    log.error("Failed to fetch recent reviews", error, {
      action: "getRecentReviews",
      practiceId,
      limit,
    });
    throw error;
  }

  return data || [];
}
