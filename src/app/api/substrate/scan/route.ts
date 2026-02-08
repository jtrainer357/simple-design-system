/**
 * Substrate Scan API Route
 * Triggers a full substrate scan for a practice, detecting triggers
 * and generating priority actions.
 *
 * POST /api/substrate/scan - Run a full scan
 * GET /api/substrate/scan - Get scan status
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectTriggers } from "@/lib/triggers/trigger-engine";
import { generateActionsInBatch, toSubstrateAction } from "@/lib/substrate/action-generator";

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
      return NextResponse.json(
        { error: "Missing practiceId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const scanId = crypto.randomUUID();

    // Log scan start
    await supabase.from("substrate_scan_log").insert({
      id: scanId,
      practice_id: practiceId,
      status: "running",
      started_at: new Date().toISOString(),
    });

    const errors: string[] = [];

    // Step 1: Detect all triggers
    let triggers;
    try {
      triggers = await detectTriggers(practiceId);
    } catch (error) {
      errors.push(`Trigger detection failed: ${error}`);
      triggers = [];
    }

    // Step 2: Generate actions for triggers
    let actions;
    try {
      actions = await generateActionsInBatch(triggers);
    } catch (error) {
      errors.push(`Action generation failed: ${error}`);
      actions = [];
    }

    // Step 3: Store actions in database
    let storedCount = 0;
    if (actions.length > 0) {
      const substrateActions = actions.map((action) => ({
        ...toSubstrateAction(action),
        practice_id: practiceId,
      }));

      const { data, error: insertError } = await supabase
        .from("substrate_actions")
        .upsert(substrateActions, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select("id");

      if (insertError) {
        errors.push(`Failed to store actions: ${insertError.message}`);
      } else {
        storedCount = data?.length || 0;
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log scan completion
    const scanStatus = errors.length === 0 ? "completed" : "completed_with_errors";
    await supabase
      .from("substrate_scan_log")
      .update({
        status: scanStatus,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        triggers_detected: triggers.length,
        actions_generated: storedCount,
        errors: errors.length > 0 ? errors : null,
      })
      .eq("id", scanId);

    const result: ScanResult = {
      scanId,
      practiceId,
      status: errors.length === 0 ? "completed" : "completed" as const,
      triggersDetected: triggers.length,
      actionsGenerated: storedCount,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date(endTime).toISOString(),
      duration,
      errors,
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
    return NextResponse.json(
      { error: "Missing practiceId or scanId" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    if (scanId) {
      // Get specific scan
      const { data, error } = await supabase
        .from("substrate_scan_log")
        .select("*")
        .eq("id", scanId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Scan not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        scanId: data.id,
        practiceId: data.practice_id,
        status: data.status,
        triggersDetected: data.triggers_detected || 0,
        actionsGenerated: data.actions_generated || 0,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        duration: data.duration_ms,
        errors: data.errors || [],
      });
    }

    // Get recent scans for practice
    const { data, error } = await supabase
      .from("substrate_scan_log")
      .select("*")
      .eq("practice_id", practiceId)
      .order("started_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch scans" },
        { status: 500 }
      );
    }

    const scans = (data || []).map((scan) => ({
      scanId: scan.id,
      practiceId: scan.practice_id,
      status: scan.status,
      triggersDetected: scan.triggers_detected || 0,
      actionsGenerated: scan.actions_generated || 0,
      startedAt: scan.started_at,
      completedAt: scan.completed_at,
      duration: scan.duration_ms,
      errors: scan.errors || [],
    }));

    return NextResponse.json({ scans });
  } catch (error) {
    console.error("Failed to fetch scan status:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan status" },
      { status: 500 }
    );
  }
}
