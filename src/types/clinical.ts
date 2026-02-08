/**
 * Clinical Types for Mental Health MVP
 * Corresponds to database schema in supabase/migrations/
 */

// ============================================
// CLINICAL OBSERVATIONS
// ============================================

/**
 * Observation value types - flexible JSONB storage
 */
export interface NumericValue {
  numeric: number;
  unit?: string;
}

export interface RangeValue {
  systolic?: number;
  diastolic?: number;
  unit?: string;
}

export interface TextValue {
  text: string;
}

export interface BooleanValue {
  boolean: boolean;
}

export interface CodedValue {
  code: string;
  display: string;
  system?: string;
}

export type ObservationValue =
  | NumericValue
  | RangeValue
  | TextValue
  | BooleanValue
  | CodedValue
  | Record<string, unknown>;

/**
 * Reference range for observations (lab results, vitals)
 */
export interface ReferenceRange {
  low?: number;
  high?: number;
  unit?: string;
  interpretation?: "normal" | "abnormal" | "critical";
  text?: string;
  // For values with sub-components (like blood pressure)
  systolic?: { low: number; high: number };
  diastolic?: { low: number; high: number };
}

/**
 * Observation status values
 */
export type ObservationStatus =
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "cancelled"
  | "entered-in-error";

/**
 * Observation types
 */
export type ObservationType = "vital" | "lab" | "assessment" | "measurement" | "note";

/**
 * Clinical Observation record
 */
export interface ClinicalObservation {
  id: string;
  practice_id: string;
  patient_id: string;

  // Identification
  observation_type: ObservationType;
  code?: string;
  code_system?: "LOINC" | "SNOMED" | "ICD-10" | "internal" | string;
  name: string;

  // Value (JSONB)
  value: ObservationValue;
  reference_range?: ReferenceRange;

  // Interpretation
  interpretation?: string;
  interpretation_code?: string;

  // Context
  observation_date: string; // ISO timestamp
  effective_period_start?: string;
  effective_period_end?: string;

  // Source
  performed_by?: string;
  method?: "automated" | "manual" | "self-reported" | string;
  device?: string;
  body_site?: string;

  // Related
  parent_observation_id?: string;

  // Notes
  notes?: string;

  // Status
  status: ObservationStatus;

  // Tracking
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

/**
 * Observation Template (for common observations)
 */
export interface ObservationTemplate {
  id: string;
  practice_id?: string; // null for system templates

  name: string;
  observation_type: ObservationType;
  code?: string;
  code_system?: string;

  value_schema: Record<string, unknown>; // JSON Schema
  default_reference_range?: ReferenceRange;

  input_type?: "number" | "text" | "select" | "range" | "boolean";
  unit?: string;
  display_order?: number;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// OUTCOME MEASURE DEFINITIONS
// ============================================

/**
 * Score interpretation for outcome measures
 */
export interface ScoreInterpretation {
  min: number;
  max: number;
  severity: string;
  label: string;
  gender?: "M" | "F"; // For gender-specific thresholds
}

/**
 * Outcome measure item/question
 */
export interface OutcomeMeasureItem {
  id: number;
  text: string;
  min?: number;
  max?: number;
  type?: "numeric" | "boolean" | "select";
  labels?: string[];
}

/**
 * Clinical guidance for outcome measure
 */
export interface ClinicalGuidance {
  recommended_use?: string;
  action_thresholds?: Record<string, string>;
  clinical_cutoff?: number;
  critical_items?: number[];
  note?: string;
}

/**
 * Outcome Measure category
 */
export type OutcomeMeasureCategory =
  | "depression"
  | "anxiety"
  | "trauma"
  | "substance"
  | "general"
  | "custom";

/**
 * Administration method
 */
export type AdministrationMethod = "self-report" | "clinician-administered" | "interview";

/**
 * Frequency recommendation
 */
export type FrequencyRecommendation = "every-visit" | "weekly" | "monthly" | "initial-only";

/**
 * Outcome Measure Definition record
 */
export interface OutcomeMeasureDefinition {
  id: string;
  practice_id?: string; // null for system-wide measures

  // Identification
  code: string; // 'PHQ-9', 'GAD-7', etc.
  name: string;
  description?: string;
  version?: string;

  // Classification
  category: OutcomeMeasureCategory;
  subcategory?: string;

  // Scoring
  min_score: number;
  max_score: number;
  score_interpretation: ScoreInterpretation[];
  items?: OutcomeMeasureItem[];

  // Clinical guidance
  clinical_guidance?: ClinicalGuidance;
  evidence_base?: string;

  // Administration
  typical_duration_minutes?: number;
  administration_method?: AdministrationMethod;
  frequency_recommendation?: FrequencyRecommendation;

  // Status
  is_system_measure: boolean;
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Item response for outcome measure
 */
export interface ItemResponse {
  item_id: number;
  response: number | boolean | string;
}

/**
 * Outcome Measure record (administration)
 */
export interface OutcomeMeasure {
  id: string;
  practice_id: string;
  patient_id: string;

  // Measure data
  definition_id?: string;
  measure_type: "PHQ-9" | "GAD-7" | "PCL-5" | "Other" | string;
  score: number;
  max_score: number;
  measurement_date: string; // ISO date

  // Detailed responses
  item_responses?: ItemResponse[];
  severity?: string;

  // Administration
  administered_by?: string;
  notes?: string;
  clinical_notes?: string;

  // Tracking
  deleted_at?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================
// PRACTICE SPECIALTIES & PROVIDER TYPES
// ============================================

/**
 * Practice specialty category
 */
export type SpecialtyCategory = "mental_health" | "primary_care" | "specialty" | "allied_health";

/**
 * Practice Specialty record
 */
export interface PracticeSpecialty {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: SpecialtyCategory;
  is_active: boolean;
  display_order?: number;
  created_at: string;
}

/**
 * Provider type category
 */
export type ProviderCategory = "physician" | "psychologist" | "therapist" | "nurse" | "other";

/**
 * Provider Type record
 */
export interface ProviderType {
  id: string;
  code: string;
  name: string;
  abbreviation: string;
  description?: string;

  // Capabilities
  can_prescribe: boolean;
  can_supervise: boolean;
  requires_supervision: boolean;

  category: ProviderCategory;
  is_active: boolean;
  display_order?: number;
  created_at: string;
}

/**
 * Practice Provider (link between practice and providers)
 */
export interface PracticeProvider {
  id: string;
  practice_id: string;
  provider_type_id: string;

  // Provider info
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  npi?: string;

  // Credentials
  credentials?: string[];
  license_number?: string;
  license_state?: string;
  license_expiration?: string;

  // Supervision
  supervisor_id?: string;

  // Status
  is_active: boolean;
  start_date?: string;
  end_date?: string;

  // Settings
  settings?: Record<string, unknown>;

  // Tracking
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================
// PRACTICE SETTINGS
// ============================================

/**
 * Practice scheduling settings
 */
export interface SchedulingSettings {
  appointment_buffer_minutes?: number;
  default_appointment_duration?: number;
  allow_online_booking?: boolean;
  reminder_settings?: {
    sms?: boolean;
    email?: boolean;
    hours_before?: number[];
  };
}

/**
 * Practice billing settings
 */
export interface BillingSettings {
  default_cpt_codes?: string[];
  accept_insurance?: boolean;
  insurance_payers?: string[];
  sliding_scale_enabled?: boolean;
}

/**
 * Practice clinical settings
 */
export interface ClinicalSettings {
  required_measures?: string[];
  measure_frequency?: FrequencyRecommendation;
  documentation_template?: "soap" | "dap" | "birp" | "custom";
}

/**
 * Practice notification settings
 */
export interface NotificationSettings {
  no_show_alerts?: boolean;
  high_risk_alerts?: boolean;
  outcome_deterioration_alerts?: boolean;
}

/**
 * Practice branding settings
 */
export interface BrandingSettings {
  logo_url?: string;
  primary_color?: string;
  portal_welcome_message?: string;
}

/**
 * Complete practice settings
 */
export interface PracticeSettings {
  scheduling?: SchedulingSettings;
  billing?: BillingSettings;
  clinical?: ClinicalSettings;
  notifications?: NotificationSettings;
  branding?: BrandingSettings;
  integrations?: {
    ehr_system?: string;
    lab_system?: string;
    pharmacy_system?: string;
  };
}

/**
 * Business hours
 */
export interface BusinessHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

/**
 * Enhanced Practice record
 */
export interface Practice {
  id: string;
  name: string;
  settings?: PracticeSettings;

  // Specialty
  specialty_id?: string;
  primary_provider_type_id?: string;

  // Contact
  npi?: string;
  tax_id?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;

  // Address
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;

  // Operations
  timezone?: string;
  business_hours?: BusinessHours;
  is_accepting_patients?: boolean;
  telehealth_enabled?: boolean;
  in_person_enabled?: boolean;

  // Tracking
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================
// AUDIT LOG
// ============================================

/**
 * Audit action types
 */
export type AuditAction = "INSERT" | "UPDATE" | "DELETE" | "SOFT_DELETE" | "RESTORE";

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: AuditAction;

  user_id?: string;
  user_email?: string;
  user_ip?: string;

  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changed_fields?: string[];

  created_at: string;
}

// ============================================
// SOFT DELETE MIXIN
// ============================================

/**
 * Fields added by soft delete support
 */
export interface SoftDeletable {
  deleted_at?: string;
}

/**
 * Fields added by tracking columns
 */
export interface Trackable {
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Helper to make specific fields optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Create input type (without id and timestamps)
 */
export type CreateInput<T> = Omit<T, "id" | "created_at" | "updated_at">;

/**
 * Update input type (all fields optional except id)
 */
export type UpdateInput<T> = Partial<Omit<T, "id" | "created_at">> & {
  id: string;
};
