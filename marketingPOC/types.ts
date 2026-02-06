/**
 * Tebra Marketing Intelligence POC
 * Provider Discovery Score Types
 *
 * Scoring Framework:
 * - SEO (40%): Traditional search visibility across directories
 * - GEO (30%): Generative Engine Optimization - AI platform citability
 * - AIO (30%): AI Overview Optimization - E-E-A-T signals & schema
 * - Composite = (SEO × 0.40) + (GEO × 0.30) + (AIO × 0.30)
 */

// ─── Input ───────────────────────────────────────────────────────────

export interface ProviderInput {
  providerName: string;
  practiceName: string;
  specialty: string;
  city: string;
  state: string;
  zip: string;
  websiteUrl?: string;
}

// ─── Directory Presence ──────────────────────────────────────────────

export interface DirectoryListing {
  directory: string;
  found: boolean;
  profileUrl?: string;
  reviewCount?: number;
  averageRating?: number;
  profileCompleteness?: "complete" | "partial" | "minimal" | "not_found";
}

// ─── Score Components ────────────────────────────────────────────────

export interface SEOScore {
  score: number; // 0-100
  directoryPresence: DirectoryListing[];
  googleBusinessProfile: boolean;
  localPackRanking: "top3" | "top10" | "beyond10" | "not_found";
  websiteOptimization: number; // 0-100
  signals: string[];
}

export interface GEOScore {
  score: number; // 0-100
  aiCitability: number; // 0-100 - likelihood AI platforms would recommend
  contentStructure: number; // 0-100 - structured data quality
  authoritySignals: number; // 0-100 - credentials, publications, expertise
  signals: string[];
}

export interface AIOScore {
  score: number; // 0-100
  eeatScore: number; // 0-100 - Experience, Expertise, Authority, Trust
  clinicalContent: number; // 0-100 - quality of clinical content
  schemaMarkup: number; // 0-100 - structured data implementation
  signals: string[];
}

// ─── Competitor ──────────────────────────────────────────────────────

export interface CompetitorProfile {
  name: string;
  practiceName?: string;
  compositeScore: number;
  seoScore: number;
  geoScore: number;
  aioScore: number;
  strengths: string[];
  websiteUrl?: string;
}

// ─── Recommendations ─────────────────────────────────────────────────

export interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  category: "seo" | "geo" | "aio";
  title: string;
  description: string;
  estimatedImpact: string;
}

// ─── Composite Score ─────────────────────────────────────────────────

export type ScoreTier = "S" | "A" | "B" | "C" | "D" | "F";

export interface ProviderDiscoveryScore {
  // Provider info
  provider: ProviderInput;

  // Timestamp
  analyzedAt: string; // ISO 8601

  // Component scores
  seo: SEOScore;
  geo: GEOScore;
  aio: AIOScore;

  // Composite
  compositeScore: number; // 0-100
  tier: ScoreTier;

  // Competitive landscape
  competitors: CompetitorProfile[];
  marketPosition: string; // e.g., "3rd of 12 analyzed providers"

  // Action items
  recommendations: Recommendation[];

  // Summary
  executiveSummary: string;
}

// ─── Tier Calculation ────────────────────────────────────────────────

export function calculateTier(score: number): ScoreTier {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "F";
}

export function calculateComposite(seo: number, geo: number, aio: number): number {
  return Math.round(seo * 0.4 + geo * 0.3 + aio * 0.3);
}
