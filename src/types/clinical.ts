/**
 * Clinical Types
 * TypeScript interfaces for clinical observations and outcome measures
 */

// ============================================
// OBSERVATION TYPES
// ============================================

/**
 * Types of clinical observations
 */
export type ObservationType = "vital" | "lab" | "assessment" | "screening" | "other";

/**
 * Status of an observation
 */
export type ObservationStatus =
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "cancelled"
  | "entered-in-error";

/**
 * Interpretation of an observation result
 */
export type ObservationInterpretation =
  | "normal"
  | "abnormal"
  | "low"
  | "high"
  | "critical"
  | "positive"
  | "negative"
  | "inconclusive";

/**
 * Code system for observation codes
 */
export type CodeSystem = "loinc" | "snomed" | "icd10" | "cpt" | "custom";

// ============================================
// OBSERVATION VALUE TYPES
// ============================================

/**
 * Numeric observation value (e.g., blood pressure, weight)
 */
export interface NumericValue {
  value: number;
  unit: string;
}

/**
 * Range observation value (e.g., blood pressure systolic/diastolic)
 */
export interface RangeValue {
  low: number;
  high: number;
  unit: string;
}

/**
 * Coded observation value (e.g., positive/negative test)
 */
export interface CodedValue {
  value: string;
  code?: string;
  display?: string;
}

/**
 * Text observation value (e.g., clinical notes)
 */
export interface TextValue {
  value: string;
}

/**
 * Union type for all possible observation values
 */
export type ObservationValue = NumericValue | RangeValue | CodedValue | TextValue;

/**
 * Reference range for an observation
 */
export interface ReferenceRange {
  low?: number;
  high?: number;
  unit?: string;
  text?: string;
  interpretation?: ObservationInterpretation;
}

// ============================================
// CLINICAL OBSERVATION
// ============================================

/**
 * Clinical observation record
 * Represents vitals, labs, assessments, and screenings
 */
export interface ClinicalObservation {
  id: string;
  practice_id: string;
  patient_id: string;

  // Classification
  observation_type: ObservationType;

  // Coding
  code: string;
  code_system: CodeSystem;
  name: string;

  // Value
  value: ObservationValue;
  reference_range?: ReferenceRange;
  interpretation?: ObservationInterpretation;

  // Status and timing
  status: ObservationStatus;
  effective_date: string; // ISO date string
  effective_time?: string; // ISO time string

  // Recording details
  recorded_by?: string;
  recorded_by_name?: string;
  method?: string;
  body_site?: string;
  device?: string;

  // Additional context
  notes?: string;
  metadata?: Record<string, unknown>;

  // Soft delete
  deleted_at?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Tracking
  created_by?: string;
  updated_by?: string;
}

// ============================================
// OUTCOME MEASURE TYPES
// ============================================

/**
 * Direction of score interpretation
 */
export type ScoreDirection = "higher_worse" | "higher_better" | "neutral";

/**
 * Severity level
 */
export type SeverityLevel =
  | "none"
  | "subthreshold"
  | "mild"
  | "moderate"
  | "moderate-severe"
  | "severe"
  | "at-risk";

/**
 * Severity range definition
 */
export interface SeverityRange {
  min: number;
  max: number;
  label: string;
  severity: SeverityLevel;
  color: string;
}

/**
 * Action thresholds for clinical decision support
 */
export interface ActionThresholds {
  urgent_referral?: number;
  follow_up_soon?: number;
  monitor?: number;
  positive_women?: number;
  positive_men?: number;
  high_risk?: number;
  probable_ptsd?: number;
  clinically_significant_change?: number;
  reliable_change?: number;
  suicidal_ideation_item?: number;
}

/**
 * Practice specialty types
 */
export type PracticeSpecialty =
  | "mental_health"
  | "primary_care"
  | "pediatrics"
  | "internal_medicine"
  | "family_medicine"
  | "psychiatry"
  | "psychology"
  | "social_work"
  | "counseling"
  | "substance_abuse"
  | "neurology"
  | "geriatrics"
  | "womens_health"
  | "other";

/**
 * Outcome measure category
 */
export type OutcomeCategory =
  | "depression"
  | "anxiety"
  | "trauma"
  | "substance"
  | "general"
  | "psychosis"
  | "eating"
  | "sleep"
  | "cognitive";

// ============================================
// OUTCOME MEASURE DEFINITION
// ============================================

/**
 * Definition of an outcome measure
 * Describes the scoring criteria and interpretation
 */
export interface OutcomeMeasureDefinition {
  id: string;

  // Identification
  code: string;
  name: string;
  description?: string;

  // Scoring
  min_score: number;
  max_score: number;
  score_direction: ScoreDirection;

  // Severity ranges
  severity_ranges: SeverityRange[];

  // Categorization
  specialty: PracticeSpecialty[];
  category?: OutcomeCategory;
  loinc_code?: string;

  // Administration
  question_count?: number;
  time_to_complete?: string;
  frequency_guidance?: string;

  // Clinical guidance
  clinical_notes?: string;
  action_thresholds?: ActionThresholds;

  // Metadata
  source?: string;
  version: string;
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================
// OUTCOME MEASURE RECORD
// ============================================

/**
 * A recorded outcome measure for a patient
 */
export interface OutcomeMeasureRecord {
  id: string;
  practice_id: string;
  patient_id: string;

  // Measure data
  measure_type: string;
  score: number;
  max_score: number;
  measurement_date: string;

  // Recording details
  administered_by?: string;
  notes?: string;

  // Tracking
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================
// HELPER TYPES
// ============================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

/**
 * Clinical observation filters
 */
export interface ClinicalObservationFilters extends PaginationParams, DateRangeFilter {
  observation_type?: ObservationType;
  code?: string;
  status?: ObservationStatus;
  interpretation?: ObservationInterpretation;
}

/**
 * Get severity info for a score
 */
export function getSeverityForScore(
  score: number,
  severityRanges: SeverityRange[]
): SeverityRange | undefined {
  return severityRanges.find((range) => score >= range.min && score <= range.max);
}

/**
 * Common LOINC codes for mental health screenings
 */
export const MENTAL_HEALTH_LOINC_CODES = {
  PHQ9_TOTAL: "44249-1",
  GAD7_TOTAL: "69737-5",
  PCL5_TOTAL: "70221-7",
  AUDITC_TOTAL: "75626-2",
  COLUMBIA_SUICIDE: "72106-8",
  PHQ9_ASSESSMENT: "44261-6",
} as const;

/**
 * Common LOINC codes for vitals
 */
export const VITAL_LOINC_CODES = {
  HEART_RATE: "8867-4",
  BODY_TEMPERATURE: "8310-5",
  DIASTOLIC_BP: "8462-4",
  SYSTOLIC_BP: "8480-6",
  RESPIRATORY_RATE: "9279-1",
  BODY_WEIGHT: "29463-7",
  BODY_HEIGHT: "8302-2",
  BMI: "39156-5",
  OXYGEN_SATURATION: "2708-6",
} as const;
