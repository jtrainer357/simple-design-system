/**
 * Tebra Marketing Intelligence POC
 * Test Runner — 3 provider analysis test cases
 *
 * Usage: GEMINI_API_KEY=your-key tsx test-runner.ts
 */

import "dotenv/config";
import { analyzeProvider } from "./analyze.js";
import type { ProviderInput, ProviderDiscoveryScore } from "./types.js";

// ─── Config ──────────────────────────────────────────────────────────

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not set. Pass via .env or environment variable.");
  console.error("   Usage: GEMINI_API_KEY=your-key tsx test-runner.ts");
  process.exit(1);
}

// ─── Test Cases ──────────────────────────────────────────────────────

const testCases: { label: string; provider: ProviderInput; expectation: string }[] = [
  {
    label: "TEST 1: Real Portland Therapist Practice",
    provider: {
      providerName: "Portland Therapy Center",
      practiceName: "Portland Therapy Center",
      specialty: "Mental Health Therapist",
      city: "Portland",
      state: "OR",
      zip: "97205",
      websiteUrl: "https://www.portlandtherapycenter.com",
    },
    expectation: "Should score moderate-to-high (real practice with web presence)",
  },
  {
    label: "TEST 2: Fictional Provider (Negative Control)",
    provider: {
      providerName: "Dr. Emily Torres",
      practiceName: "Healing Minds Counseling",
      specialty: "Licensed Clinical Psychologist",
      city: "Portland",
      state: "OR",
      zip: "97205",
    },
    expectation: "Should score very low (fictional, no real web presence)",
  },
  {
    label: "TEST 3: BetterHelp (Positive Control)",
    provider: {
      providerName: "BetterHelp",
      practiceName: "BetterHelp",
      specialty: "Online Therapy Platform",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      websiteUrl: "https://www.betterhelp.com",
    },
    expectation: "Should score very high (major national brand)",
  },
];

// ─── Pretty Printer ──────────────────────────────────────────────────

function printScoreCard(result: ProviderDiscoveryScore): void {
  const bar = (score: number, width = 20): string => {
    const filled = Math.round((score / 100) * width);
    return "█".repeat(filled) + "░".repeat(width - filled);
  };

  const tierColors: Record<string, string> = {
    S: "\x1b[35m",
    A: "\x1b[32m",
    B: "\x1b[36m",
    C: "\x1b[33m",
    D: "\x1b[31m",
    F: "\x1b[91m",
  };

  const reset = "\x1b[0m";
  const bold = "\x1b[1m";
  const dim = "\x1b[2m";
  const tierColor = tierColors[result.tier] || reset;

  console.log(`\n  ┌──────────────────────────────────────────────────────┐`);
  console.log(`  │  ${bold}PROVIDER DISCOVERY SCORE${reset}                            │`);
  console.log(`  ├──────────────────────────────────────────────────────┤`);
  console.log(`  │  ${bold}${result.provider.providerName}${reset}`);
  console.log(`  │  ${dim}${result.provider.practiceName}${reset}`);
  console.log(
    `  │  ${dim}${result.provider.city}, ${result.provider.state} ${result.provider.zip}${reset}`
  );
  console.log(`  ├──────────────────────────────────────────────────────┤`);
  console.log(
    `  │  ${tierColor}${bold}TIER ${result.tier}${reset}  •  Composite: ${bold}${result.compositeScore}/100${reset}`
  );
  console.log(`  │`);
  console.log(`  │  SEO  ${bar(result.seo.score)}  ${result.seo.score}`);
  console.log(`  │  GEO  ${bar(result.geo.score)}  ${result.geo.score}`);
  console.log(`  │  AIO  ${bar(result.aio.score)}  ${result.aio.score}`);
  console.log(`  ├──────────────────────────────────────────────────────┤`);

  const dirs = result.seo.directoryPresence || [];
  const found = dirs.filter((d) => d.found).length;
  console.log(`  │  📂 Directories: ${found}/${dirs.length} found`);
  for (const d of dirs) {
    const icon = d.found ? "✅" : "❌";
    const rating =
      d.found && d.averageRating ? ` (${d.averageRating}★, ${d.reviewCount ?? 0} reviews)` : "";
    console.log(`  │     ${icon} ${d.directory}${rating}`);
  }

  if (result.competitors.length > 0) {
    console.log(`  ├──────────────────────────────────────────────────────┤`);
    console.log(`  │  🏆 Competitive Landscape: ${result.marketPosition}`);
    for (const c of result.competitors.slice(0, 5)) {
      const cTier =
        c.compositeScore >= 75
          ? "A"
          : c.compositeScore >= 60
            ? "B"
            : c.compositeScore >= 40
              ? "C"
              : "D";
      console.log(
        `  │     ${cTier} ${c.compositeScore} — ${c.name}${c.practiceName ? ` (${c.practiceName})` : ""}`
      );
    }
  }

  if (result.recommendations.length > 0) {
    console.log(`  ├──────────────────────────────────────────────────────┤`);
    console.log(`  │  💡 Top Recommendations:`);
    for (const r of result.recommendations.slice(0, 3)) {
      const prioIcon =
        r.priority === "critical"
          ? "🔴"
          : r.priority === "high"
            ? "🟠"
            : r.priority === "medium"
              ? "🟡"
              : "🟢";
      console.log(`  │     ${prioIcon} [${r.category.toUpperCase()}] ${r.title}`);
      console.log(
        `  │        ${dim}${r.description.substring(0, 70)}${r.description.length > 70 ? "..." : ""}${reset}`
      );
    }
  }

  console.log(`  ├──────────────────────────────────────────────────────┤`);
  console.log(`  │  ${dim}${result.executiveSummary || "No summary available."}${reset}`);
  console.log(`  └──────────────────────────────────────────────────────┘`);
}

// ─── Runner ──────────────────────────────────────────────────────────

async function runTests(): Promise<void> {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   TEBRA MARKETING INTELLIGENCE POC — Test Runner        ║");
  console.log("║   Gemini 2.0 Flash + Google Search Grounding            ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const results: {
    label: string;
    result?: ProviderDiscoveryScore;
    error?: string;
    time: number;
  }[] = [];
  const overallStart = Date.now();

  for (const tc of testCases) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`  ${tc.label}`);
    console.log(`  Expected: ${tc.expectation}`);
    console.log("═".repeat(60));

    const tcStart = Date.now();
    try {
      const result = await analyzeProvider(tc.provider, {
        apiKey: API_KEY!,
        enableGrounding: true,
        verbose: true,
      });

      printScoreCard(result);
      results.push({ label: tc.label, result, time: (Date.now() - tcStart) / 1000 });
    } catch (error) {
      const errMsg = (error as Error).message;
      console.error(`\n  ❌ FAILED: ${errMsg}`);
      results.push({ label: tc.label, error: errMsg, time: (Date.now() - tcStart) / 1000 });
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────

  const totalTime = ((Date.now() - overallStart) / 1000).toFixed(1);

  console.log(`\n\n${"═".repeat(60)}`);
  console.log(`  📊 TEST SUMMARY`);
  console.log("═".repeat(60));

  for (const r of results) {
    const status = r.result ? "✅ PASS" : "❌ FAIL";
    const score = r.result
      ? `Score: ${r.result.compositeScore} (Tier ${r.result.tier})`
      : `Error: ${r.error}`;
    console.log(`  ${status}  ${r.label}`);
    console.log(`         ${score} — ${r.time.toFixed(1)}s`);
  }

  console.log(`\n  ⏱ Total time: ${totalTime}s`);

  console.log(`\n  🔍 Validation Checks:`);

  const [real, fictional, betterhelp] = results;

  if (real?.result && fictional?.result) {
    const diff = real.result.compositeScore - fictional.result.compositeScore;
    const check = diff > 0 ? "✅" : "⚠️";
    console.log(
      `  ${check} Real provider (${real.result.compositeScore}) vs Fictional (${fictional.result.compositeScore}): diff = ${diff > 0 ? "+" : ""}${diff}`
    );
  }

  if (betterhelp?.result && fictional?.result) {
    const diff = betterhelp.result.compositeScore - fictional.result.compositeScore;
    const check = diff > 20 ? "✅" : "⚠️";
    console.log(
      `  ${check} BetterHelp (${betterhelp.result.compositeScore}) vs Fictional (${fictional.result.compositeScore}): diff = ${diff > 0 ? "+" : ""}${diff}`
    );
  }

  for (const r of results) {
    if (r.result) {
      const hasCompetitors = r.result.competitors.length >= 2;
      const check = hasCompetitors ? "✅" : "⚠️";
      console.log(`  ${check} ${r.label}: ${r.result.competitors.length} competitors found`);
    }
  }

  const allUnder45 = results.every((r) => r.time < 45);
  console.log(`  ${allUnder45 ? "✅" : "⚠️"} All analyses under 45s: ${allUnder45}`);

  const allValid = results.every((r) => r.result != null);
  console.log(`  ${allValid ? "✅" : "❌"} All returned valid JSON: ${allValid}`);

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  POC Status: ${allValid ? "🟢 SUCCESS" : "🔴 PARTIAL FAILURE"}`);
  console.log("═".repeat(60));

  const outputPath = "./test-results.json";
  const fs = await import("fs");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      results.map((r) => ({
        label: r.label,
        time: r.time,
        score: r.result || null,
        error: r.error || null,
      })),
      null,
      2
    )
  );
  console.log(`\n  💾 Full results saved to ${outputPath}`);
}

runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
