# 🔍 Tebra Marketing Intelligence POC

**Provider Discovery Score** — Gemini 2.0 Flash + Google Search Grounding

## What This Does

Calls Gemini 2.0 Flash with Google Search grounding to analyze a mental health provider's online visibility and returns a structured **Provider Discovery Score** with:

- **SEO Score** (40% weight): Directory presence across 8 platforms, GBP, local ranking
- **GEO Score** (30% weight): AI citability — would ChatGPT/Gemini recommend this provider?
- **AIO Score** (30% weight): E-E-A-T signals, clinical content quality, schema markup
- **Composite Score**: Weighted aggregate with tier (S/A/B/C/D/F)
- **Competitors**: 4-6 real competitors with scores
- **Recommendations**: Prioritized action items

## Setup

```bash
npm install
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

## Run

```bash
# Run all 3 test cases
npm test

# Or directly
GEMINI_API_KEY=your-key npx tsx test-runner.ts
```

## Test Cases

1. **Real Practice** — Portland Therapy Center (should score moderate-high)
2. **Fictional Provider** — Dr. Emily Torres / Healing Minds Counseling (should score very low)
3. **Major Brand** — BetterHelp (should score very high)

## Success Criteria

- ✅ Valid JSON from all 3 tests
- ✅ Real provider scores higher than fictional
- ✅ Competitors array has actual practice names
- ✅ Each analysis < 45 seconds

## File Structure

```
/poc/marketing-intelligence/
├── types.ts          # ProviderDiscoveryScore interface
├── prompt.ts         # Gemini prompt template
├── analyze.ts        # Core analysis engine
├── test-runner.ts    # 3 test cases + pretty printing
├── .env.example      # Config template
└── README.md
```

## Integration Path

This POC validates the Gemini + Search Grounding approach. To integrate into the main MHMVP:

1. Import `analyzeProvider()` from this module
2. Wire to the Marketing page's "Run Analysis" button
3. Store results in Supabase `marketing_scores` table
4. Display via the Marketing Intelligence dashboard component
