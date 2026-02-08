/**
 * Substrate Scan API Route
 * Triggers a full substrate scan for a practice, detecting triggers
 * and generating priority actions.
 *
 * Note: This is a stub implementation. Full implementation requires
 * substrate_scan_log and substrate_actions tables.
 *
 * POST /api/substrate/scan - Run a full scan
 * GET /api/substrate/scan - Get scan status
 */

import { NextRequest, NextResponse } from "next/server";

interface ScanResult {
  scanId: string;
  practiceId: string;
  status: "pending" | "running" | "completed" | "failed";
  triggersDetected: number;
  actionsGenerated: number;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  errors: string[];
}

/**
 * POST /api/substrate/scan
 * Triggers a new substrate scan for the practice
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { practiceId } = body;

    if (!practiceId) {
      return NextResponse.json({ error: "Missing practiceId" }, { status: 400 });
    }

    const scanId = crypto.randomUUID();
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Stub response - in production this would trigger actual scanning
    const result: ScanResult = {
      scanId,
      practiceId,
      status: "completed",
      triggersDetected: 0,
      actionsGenerated: 0,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date(endTime).toISOString(),
      duration,
      errors: [],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Substrate scan failed:", error);
    return NextResponse.json(
      {
        error: "Scan failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/substrate/scan
 * Get recent scan status for a practice
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const practiceId = searchParams.get("practiceId");
  const scanId = searchParams.get("scanId");

  if (!practiceId && !scanId) {
    return NextResponse.json({ error: "Missing practiceId or scanId" }, { status: 400 });
  }

  // Stub response - returns empty scan history
  return NextResponse.json({ scans: [] });
}
