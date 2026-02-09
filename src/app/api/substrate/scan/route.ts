/**
 * POST /api/substrate/scan
 * Run a full substrate scan to detect triggers and generate actions
 */

import { NextResponse } from "next/server";
import { runSubstrateScan, type SubstrateScanResult } from "@/src/lib/substrate/service";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("api/substrate/scan");

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Parse optional body for practice_id and triggered_by
    let practiceId = DEMO_PRACTICE_ID;
    let triggeredBy: "system" | "manual" | "scheduled" = "manual";

    try {
      const body = await request.json();
      if (body.practice_id) practiceId = body.practice_id;
      if (body.triggered_by) triggeredBy = body.triggered_by;
    } catch {
      // Empty body is fine, use defaults
    }

    log.info("Starting substrate scan via API", { practiceId, triggeredBy });

    const result: SubstrateScanResult = await runSubstrateScan(practiceId, triggeredBy);

    log.info("Substrate scan completed via API", {
      scanId: result.scan_id,
      triggersDetected: result.triggers_detected,
      actionsCreated: result.actions_created,
      duration: result.duration_ms,
    });

    return NextResponse.json({
      success: true,
      scan_id: result.scan_id,
      triggers_detected: result.triggers_detected,
      actions_created: result.actions_created,
      duration_ms: result.duration_ms,
      trigger_counts: result.trigger_counts,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Substrate scan API failed", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
