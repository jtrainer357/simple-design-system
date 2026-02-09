/**
 * GET /api/substrate/actions
 * Fetch active substrate actions for a practice
 */

import { NextResponse } from "next/server";
import { getSubstrateActions, getSubstrateActionCounts } from "@/src/lib/substrate/service";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("api/substrate/actions");

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const practiceId = searchParams.get("practice_id") || DEMO_PRACTICE_ID;
    const patientId = searchParams.get("patient_id") || undefined;
    const status = searchParams.get("status") || "active";
    const urgencyParam = searchParams.get("urgency");
    const urgency = urgencyParam ? urgencyParam.split(",") : undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const includeCounts = searchParams.get("include_counts") === "true";

    log.debug("Fetching substrate actions", {
      practiceId,
      patientId,
      status,
      urgency,
      limit,
    });

    const actions = await getSubstrateActions(practiceId, {
      patientId,
      status,
      urgency,
      limit,
    });

    // Optionally include counts
    let counts;
    if (includeCounts) {
      counts = await getSubstrateActionCounts(practiceId);
    }

    return NextResponse.json({
      success: true,
      actions,
      total: actions.length,
      counts,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("Failed to fetch substrate actions", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        actions: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}
