/**
 * PATCH /api/substrate/actions/[id]
 * Update a substrate action's status (complete, dismiss, snooze)
 *
 * GET /api/substrate/actions/[id]
 * Fetch a single substrate action by ID
 */

import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/client";
import {
  updateSubstrateActionStatus,
  toggleSuggestedAction,
  type SubstrateActionWithPatient,
} from "@/src/lib/substrate/service";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import { createLogger } from "@/src/lib/logger";
import { z } from "zod";

// Helper to get an untyped client for tables not in TypeScript types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUntypedClient(): any {
  return createClient();
}

const log = createLogger("api/substrate/actions/[id]");

// Validation schema for PATCH body
const updateSchema = z.object({
  status: z.enum(["completed", "dismissed", "snoozed"]).optional(),
  reason: z.string().optional(),
  snoozed_until: z.string().optional(),
  completed_by: z.string().optional(),
  // For toggling individual suggested actions
  toggle_suggested: z
    .object({
      index: z.number(),
      completed: z.boolean(),
    })
    .optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const practiceId = searchParams.get("practice_id") || DEMO_PRACTICE_ID;

    const supabase = getUntypedClient();

    const { data: action, error } = await supabase
      .from("substrate_actions")
      .select(
        `
        *,
        patient:patients(
          id,
          first_name,
          last_name,
          date_of_birth,
          risk_level,
          avatar_url
        )
      `
      )
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (error) {
      log.error("Failed to fetch substrate action", error);
      return NextResponse.json({ success: false, error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      action: action as SubstrateActionWithPatient,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("GET action failed", error);

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const parseResult = updateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { status, reason, snoozed_until, completed_by, toggle_suggested } = parseResult.data;
    const practiceId = body.practice_id || DEMO_PRACTICE_ID;

    log.info("Updating substrate action", { id, status, practiceId });

    // Handle suggested action toggle
    if (toggle_suggested !== undefined) {
      const updated = await toggleSuggestedAction(
        id,
        toggle_suggested.index,
        toggle_suggested.completed,
        practiceId
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Failed to toggle suggested action" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: updated,
      });
    }

    // Handle status update
    if (!status) {
      return NextResponse.json(
        { success: false, error: "status is required for updates" },
        { status: 400 }
      );
    }

    const updated = await updateSubstrateActionStatus(id, practiceId, {
      status,
      reason,
      snoozed_until,
      completed_by,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Action not found or update failed" },
        { status: 404 }
      );
    }

    log.info("Substrate action updated", { id, status });

    return NextResponse.json({
      success: true,
      action: updated,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    log.error("PATCH action failed", error);

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
