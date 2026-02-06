/**
 * Tebra Marketing Intelligence POC
 * Gemini Prompt Template for Provider Discovery Score
 */

import type { ProviderInput } from "./types.js";

export function buildAnalysisPrompt(provider: ProviderInput): string {
  const websiteLine = provider.websiteUrl
    ? `Website: ${provider.websiteUrl}`
    : "Website: Not provided";

  return `You are a healthcare marketing intelligence analyst. Analyze the online visibility and discoverability of this mental health provider using real-time web search data.

## Provider Information
- Provider Name: ${provider.providerName}
- Practice Name: ${provider.practiceName}
- Specialty: ${provider.specialty}
- Location: ${provider.city}, ${provider.state} ${provider.zip}
- ${websiteLine}

## Your Task

Search for this provider across the internet and score their online presence. Be accurate — if you cannot find them on a directory, mark found: false. Do not fabricate listings.

### 1. SEO Score (0-100) — Traditional Search Visibility
Search these directories and report what you actually find:
- Psychology Today
- Healthgrades
- Google Business Profile
- Yelp
- TherapyDen
- Zocdoc
- Vitals
- WebMD

Score based on:
- Number of directories where provider has a profile
- Google Business Profile presence and completeness
- Local pack ranking signals (would they appear in "therapist near me" searches?)
- Website optimization (if URL provided): meta tags, page speed signals, mobile-friendly

### 2. GEO Score (0-100) — Generative Engine Optimization
Score the likelihood that AI platforms (ChatGPT, Gemini, Perplexity, Copilot) would cite or recommend this provider when asked "recommend a ${provider.specialty} in ${provider.city}, ${provider.state}":
- AI citability: How likely are AI assistants to surface this provider?
- Content structure: Is their content well-organized for AI extraction?
- Authority signals: Credentials, publications, professional memberships, media mentions

### 3. AIO Score (0-100) — AI Overview Optimization
- E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness): Clinical credentials, years of experience, patient testimonials
- Clinical content quality: Blog posts, condition pages, treatment approach descriptions
- Schema markup: JSON-LD structured data, medical practitioner schema, FAQ schema

### 4. Competitors
Find 4-6 real competitors (other ${provider.specialty} providers) in the ${provider.city}, ${provider.state} ${provider.zip} area. For each, estimate their composite score.

### 5. Composite Score
Calculate: Composite = (SEO × 0.40) + (GEO × 0.30) + (AIO × 0.30)

Assign tier:
- S: 90-100 (Elite visibility)
- A: 75-89 (Strong presence)
- B: 60-74 (Good foundation)
- C: 40-59 (Needs improvement)
- D: 20-39 (Poor visibility)
- F: 0-19 (Virtually invisible)

### 6. Recommendations
Provide 3-5 prioritized recommendations to improve their score.

## RESPONSE FORMAT

Return ONLY valid JSON matching this exact schema. No markdown, no commentary, no backticks — just the JSON object:

{
  "provider": {
    "providerName": "${provider.providerName}",
    "practiceName": "${provider.practiceName}",
    "specialty": "${provider.specialty}",
    "city": "${provider.city}",
    "state": "${provider.state}",
    "zip": "${provider.zip}"${provider.websiteUrl ? `,\n    "websiteUrl": "${provider.websiteUrl}"` : ""}
  },
  "analyzedAt": "<ISO 8601 timestamp>",
  "seo": {
    "score": <0-100>,
    "directoryPresence": [
      {
        "directory": "<name>",
        "found": <true/false>,
        "profileUrl": "<url or null>",
        "reviewCount": <number or null>,
        "averageRating": <number or null>,
        "profileCompleteness": "<complete|partial|minimal|not_found>"
      }
    ],
    "googleBusinessProfile": <true/false>,
    "localPackRanking": "<top3|top10|beyond10|not_found>",
    "websiteOptimization": <0-100>,
    "signals": ["<signal1>", "<signal2>"]
  },
  "geo": {
    "score": <0-100>,
    "aiCitability": <0-100>,
    "contentStructure": <0-100>,
    "authoritySignals": <0-100>,
    "signals": ["<signal1>", "<signal2>"]
  },
  "aio": {
    "score": <0-100>,
    "eeatScore": <0-100>,
    "clinicalContent": <0-100>,
    "schemaMarkup": <0-100>,
    "signals": ["<signal1>", "<signal2>"]
  },
  "compositeScore": <0-100>,
  "tier": "<S|A|B|C|D|F>",
  "competitors": [
    {
      "name": "<provider name>",
      "practiceName": "<practice name>",
      "compositeScore": <0-100>,
      "seoScore": <0-100>,
      "geoScore": <0-100>,
      "aioScore": <0-100>,
      "strengths": ["<strength1>", "<strength2>"],
      "websiteUrl": "<url or null>"
    }
  ],
  "marketPosition": "<e.g., '3rd of 6 analyzed providers'>",
  "recommendations": [
    {
      "priority": "<critical|high|medium|low>",
      "category": "<seo|geo|aio>",
      "title": "<short title>",
      "description": "<actionable description>",
      "estimatedImpact": "<e.g., '+15-20 points to SEO score'>"
    }
  ],
  "executiveSummary": "<2-3 sentence summary of findings>"
}

CRITICAL: Return ONLY the JSON object. No markdown fences, no explanation text, no preamble.`;
}

export const SYSTEM_INSTRUCTION = `You are a healthcare marketing intelligence analyst specializing in provider visibility scoring. You have access to Google Search to verify real-time web presence of healthcare providers. Always use search to verify actual directory listings — never fabricate or guess. If a provider cannot be found, score them accordingly with low scores. Return only valid JSON.`;
