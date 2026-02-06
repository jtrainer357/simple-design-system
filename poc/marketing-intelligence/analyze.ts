/**
 * Tebra Marketing Intelligence POC
 * Gemini 2.0 Flash Analysis Engine
 *
 * Calls Gemini with Google Search grounding to analyze
 * provider online visibility and return a structured score.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProviderInput, ProviderDiscoveryScore } from "./types.js";
import { calculateComposite, calculateTier } from "./types.js";
import { buildAnalysisPrompt, SYSTEM_INSTRUCTION } from "./prompt.js";

// ─── Configuration ───────────────────────────────────────────────────

const GEMINI_MODEL = "gemini-2.0-flash";

interface AnalysisConfig {
  apiKey: string;
  enableGrounding?: boolean;
  groundingThreshold?: number;
  maxRetries?: number;
  verbose?: boolean;
}

// ─── Core Analysis Function ──────────────────────────────────────────

export async function analyzeProvider(
  provider: ProviderInput,
  config: AnalysisConfig
): Promise<ProviderDiscoveryScore> {
  const {
    apiKey,
    enableGrounding = true,
    groundingThreshold = 0.3,
    maxRetries = 2,
    verbose = false,
  } = config;

  const startTime = Date.now();

  if (verbose) {
    console.log(`\n🔍 Analyzing: ${provider.providerName} (${provider.practiceName})`);
    console.log(`   Location: ${provider.city}, ${provider.state} ${provider.zip}`);
    console.log(`   Grounding: ${enableGrounding ? "enabled" : "disabled"}`);
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Build tool config for Google Search grounding (new API format)
  const tools: any[] = enableGrounding ? [{ google_search: {} }] : [];

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
    tools,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    },
  });

  const prompt = buildAnalysisPrompt(provider);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (verbose && attempt > 0) {
        console.log(`   ⟳ Retry attempt ${attempt}/${maxRetries}...`);
      }

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (verbose) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   ⏱ Gemini responded in ${elapsed}s`);

        const candidate = response.candidates?.[0];
        const groundingMeta = candidate?.groundingMetadata;
        if (groundingMeta) {
          console.log(`   🌐 Grounding: ${groundingMeta.searchEntryPoint ? "Active" : "Passive"}`);
          // Note: SDK has typo 'groundingChuncks' in type defs
          const chunks =
            (groundingMeta as any).groundingChunks ?? (groundingMeta as any).groundingChuncks;
          if (chunks) {
            console.log(`   📚 Sources: ${chunks.length} grounding chunks`);
          }
        }
      }

      const parsed = parseJsonResponse(text);
      const validated = validateAndFixScore(parsed, provider);

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      if (verbose) {
        console.log(`   ✅ Analysis complete in ${totalTime}s`);
        console.log(`   📊 Composite: ${validated.compositeScore} (Tier ${validated.tier})`);
      }

      return validated;
    } catch (error) {
      lastError = error as Error;
      if (verbose) {
        console.log(`   ⚠️ Attempt ${attempt + 1} failed: ${(error as Error).message}`);
      }

      if (attempt === 0 && enableGrounding && isGroundingError(error)) {
        if (verbose) {
          console.log(`   🔄 Retrying without grounding...`);
        }
        return analyzeProvider(provider, { ...config, enableGrounding: false });
      }

      if (attempt < maxRetries) {
        await delay(1000 * (attempt + 1));
      }
    }
  }

  throw new Error(`Analysis failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

// ─── JSON Parsing ────────────────────────────────────────────────────

function parseJsonResponse(text: string): any {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }

  cleaned = cleaned.trim();

  if (!cleaned.startsWith("{")) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error(`❌ JSON parse error. First 500 chars of response:`);
    console.error(cleaned.substring(0, 500));
    throw new Error(`Failed to parse Gemini response as JSON: ${(error as Error).message}`);
  }
}

// ─── Validation ──────────────────────────────────────────────────────

function validateAndFixScore(data: any, provider: ProviderInput): ProviderDiscoveryScore {
  data.provider = { ...provider, ...data.provider };

  const seoScore = clamp(data.seo?.score ?? 0, 0, 100);
  const geoScore = clamp(data.geo?.score ?? 0, 0, 100);
  const aioScore = clamp(data.aio?.score ?? 0, 0, 100);

  data.seo = data.seo || { score: seoScore, directoryPresence: [], signals: [] };
  data.geo = data.geo || { score: geoScore, signals: [] };
  data.aio = data.aio || { score: aioScore, signals: [] };

  data.seo.score = seoScore;
  data.geo.score = geoScore;
  data.aio.score = aioScore;

  data.compositeScore = calculateComposite(seoScore, geoScore, aioScore);
  data.tier = calculateTier(data.compositeScore);

  data.competitors = data.competitors || [];
  data.recommendations = data.recommendations || [];
  data.seo.directoryPresence = data.seo.directoryPresence || [];
  data.seo.signals = data.seo.signals || [];
  data.geo.signals = data.geo.signals || [];
  data.aio.signals = data.aio.signals || [];

  data.analyzedAt = data.analyzedAt || new Date().toISOString();

  return data as ProviderDiscoveryScore;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGroundingError(error: unknown): boolean {
  const msg = String(error);
  return (
    msg.includes("grounding") ||
    msg.includes("googleSearchRetrieval") ||
    msg.includes("INVALID_ARGUMENT")
  );
}
