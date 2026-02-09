/**
 * Substrate Intelligence Service
 * Orchestrates the full substrate pipeline: detect triggers → generate actions → persist
 *
 * @module substrate/service
 */

import { createClient } from "@/src/lib/supabase/client";
import { createLogger } from "@/src/lib/logger";
import { DEMO_PRACTICE_ID } from "@/src/lib/utils/demo-date";
import {
  detectTriggers,
  getTriggerCounts,
  sortTriggersByUrgency,
} from "@/src/lib/triggers/trigger-engine";
import { generateActionsInBatch, toSubstrateAction } from "@/src/lib/substrate/action-generator";
import type { TriggerContext, TriggerEvent, UrgencyLevel } from "@/src/lib/triggers";

const log = createLogger("substrate/service");

/**
 * Helper to get an untyped Supabase client for tables not in the TypeScript types.
 * The substrate_actions and substrate_scan_log tables are defined in migrations
 * but not yet added to the generated types.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getUntypedClient(): any {
  return createClient();
}

/**
 * Result from a full substrate scan
 */
export interface SubstrateScanResult {
  scan_id: string;
  practice_id: string;
  triggers_detected: number;
  actions_created: number;
  duration_ms: number;
  trigger_counts: Record<TriggerEvent, number>;
  errors: string[];
}

/**
 * Substrate action as stored in database
 */
export interface SubstrateActionRow {
  id: string;
  practice_id: string;
  patient_id: string | null;
  trigger_type: string;
  title: string;
  context: string;
  urgency: string;
  time_frame: string;
  ai_confidence: number;
  ai_reasoning: string | null;
  suggested_actions: SuggestedActionPayload[];
  status: "active" | "completed" | "dismissed" | "snoozed";
  snoozed_until: string | null;
  dismissed_reason: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

/**
 * Substrate action with patient details for display
 */
export interface SubstrateActionWithPatient extends SubstrateActionRow {
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    risk_level: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Suggested action payload structure
 */
export interface SuggestedActionPayload {
  label: string;
  type: string;
  payload?: Record<string, unknown>;
  completed?: boolean;
}

/**
 * Insert type for substrate_actions table
 */
interface SubstrateActionInsert {
  practice_id: string;
  patient_id: string | null;
  trigger_type: string;
  title: string;
  context: string;
  urgency: UrgencyLevel | string;
  time_frame: string;
  ai_confidence: number;
  ai_reasoning?: string;
  suggested_actions: SuggestedActionPayload[];
  status: "active";
}

/**
 * Run a full substrate scan for a practice
 * Detects all triggers → generates actions → persists to database
 */
export async function runSubstrateScan(
  practiceId: string = DEMO_PRACTICE_ID,
  triggeredBy: "system" | "manual" | "scheduled" = "manual"
): Promise<SubstrateScanResult> {
  const startTime = Date.now();
  const supabase = getUntypedClient();
  const errors: string[] = [];

  log.info("Starting substrate scan", { practiceId, triggeredBy });

  // Create scan log entry
  let scanId = "unknown";
  try {
    const { data: scanLog, error: scanLogError } = await supabase
      .from("substrate_scan_log")
      .insert({
        practice_id: practiceId,
        status: "running",
        started_at: new Date().toISOString(),
        triggered_by: triggeredBy,
      })
      .select()
      .single();

    if (scanLogError) {
      log.error("Failed to create scan log", scanLogError);
      errors.push(`Scan log creation failed: ${scanLogError.message}`);
    } else {
      scanId = scanLog?.id || "unknown";
    }
  } catch (err) {
    log.warn("Scan log table may not exist yet", { error: String(err) });
  }

  try {
    // Step 1: Detect all triggers
    const triggers = await detectTriggers(practiceId);
    const triggerCounts = getTriggerCounts(triggers);
    const sortedTriggers = sortTriggersByUrgency(triggers);

    log.info(`Detected ${triggers.length} triggers`, { practiceId, triggerCounts });

    if (triggers.length === 0) {
      // No triggers, complete scan
      await updateScanLog(supabase, scanId, {
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        triggers_detected: 0,
        actions_generated: 0,
      });

      return {
        scan_id: scanId,
        practice_id: practiceId,
        triggers_detected: 0,
        actions_created: 0,
        duration_ms: Date.now() - startTime,
        trigger_counts: triggerCounts,
        errors,
      };
    }

    // Step 2: Generate actions from triggers
    const actionsMap = await generateActionsInBatch(sortedTriggers);
    log.info(`Generated ${actionsMap.size} actions from triggers`);

    // Step 3: Convert to database format and deduplicate
    const actionsToInsert: SubstrateActionInsert[] = [];

    for (const [trigger, generatedAction] of actionsMap) {
      // Check for existing active action with same trigger type + patient
      let existing = null;
      try {
        const { data } = await supabase
          .from("substrate_actions")
          .select("id")
          .eq("practice_id", practiceId)
          .eq("patient_id", trigger.patient_id)
          .eq("trigger_type", trigger.event)
          .eq("status", "active")
          .limit(1)
          .single();
        existing = data;
      } catch {
        // Table may not exist or no duplicate
      }

      if (!existing) {
        const substrateAction = toSubstrateAction(trigger, generatedAction, practiceId);

        actionsToInsert.push({
          practice_id: practiceId,
          patient_id: trigger.patient_id,
          trigger_type: trigger.event,
          title: substrateAction.title,
          context: substrateAction.context || generatedAction.context,
          urgency: substrateAction.urgency,
          time_frame: generatedAction.time_frame,
          ai_confidence: Math.round(generatedAction.confidence),
          ai_reasoning: `Trigger detected: ${trigger.event}. ${generatedAction.context}`,
          suggested_actions: generatedAction.suggested_actions.map((sa) => ({
            label: sa.label,
            type: sa.type,
            payload: sa.payload,
            completed: false,
          })),
          status: "active",
        });
      }
    }

    log.info(
      `Inserting ${actionsToInsert.length} new actions (${actionsMap.size - actionsToInsert.length} duplicates skipped)`
    );

    // Step 4: Insert actions into database
    let actionsCreated = 0;

    if (actionsToInsert.length > 0) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from("substrate_actions")
          .insert(actionsToInsert)
          .select();

        if (insertError) {
          log.error("Failed to insert substrate actions", insertError);
          errors.push(`Action insert failed: ${insertError.message}`);
        } else {
          actionsCreated = inserted?.length || 0;
        }
      } catch (err) {
        log.error("substrate_actions table may not exist", { error: String(err) });
        errors.push("substrate_actions table not available");
      }
    }

    // Step 5: Update scan log with results
    const duration = Date.now() - startTime;
    await updateScanLog(supabase, scanId, {
      status: errors.length > 0 ? "completed_with_errors" : "completed",
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      triggers_detected: triggers.length,
      actions_generated: actionsCreated,
      errors: errors.length > 0 ? errors : null,
    });

    log.info("Substrate scan completed", {
      scanId,
      triggersDetected: triggers.length,
      actionsCreated,
      duration,
    });

    return {
      scan_id: scanId,
      practice_id: practiceId,
      triggers_detected: triggers.length,
      actions_created: actionsCreated,
      duration_ms: duration,
      trigger_counts: triggerCounts,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    errors.push(errorMsg);

    log.error("Substrate scan failed", error);

    await updateScanLog(supabase, scanId, {
      status: "failed",
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      errors: errors,
    });

    return {
      scan_id: scanId,
      practice_id: practiceId,
      triggers_detected: 0,
      actions_created: 0,
      duration_ms: duration,
      trigger_counts: {} as Record<TriggerEvent, number>,
      errors,
    };
  }
}

/**
 * Update scan log entry
 */

async function updateScanLog(
  supabase: ReturnType<typeof getUntypedClient>,
  scanId: string,
  updates: {
    status: string;
    completed_at?: string;
    duration_ms?: number;
    triggers_detected?: number;
    actions_generated?: number;
    errors?: string[] | null;
  }
): Promise<void> {
  if (scanId === "unknown") return;

  try {
    const { error } = await supabase.from("substrate_scan_log").update(updates).eq("id", scanId);

    if (error) {
      log.error("Failed to update scan log", error);
    }
  } catch (err) {
    log.warn("Could not update scan log", { error: String(err) });
  }
}

/**
 * Get active substrate actions for a practice
 */
export async function getSubstrateActions(
  practiceId: string = DEMO_PRACTICE_ID,
  options: {
    patientId?: string;
    status?: string;
    urgency?: string[];
    limit?: number;
  } = {}
): Promise<SubstrateActionWithPatient[]> {
  const supabase = getUntypedClient();

  try {
    let query = supabase
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
      .eq("practice_id", practiceId);

    // Apply filters
    if (options.patientId) {
      query = query.eq("patient_id", options.patientId);
    }

    if (options.status) {
      query = query.eq("status", options.status);
    } else {
      // Default to active only
      query = query.eq("status", "active");
    }

    if (options.urgency && options.urgency.length > 0) {
      query = query.in("urgency", options.urgency);
    }

    // Order by urgency priority then created_at
    query = query.order("created_at", { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      log.error("Failed to fetch substrate actions", error);
      return [];
    }

    // Sort by urgency priority
    const urgencyOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    const actions = (data || []) as SubstrateActionWithPatient[];
    return actions.sort((a, b) => {
      const aOrder = urgencyOrder[a.urgency] ?? 4;
      const bOrder = urgencyOrder[b.urgency] ?? 4;
      return aOrder - bOrder;
    });
  } catch (err) {
    log.error("substrate_actions table may not exist", { error: String(err) });
    return [];
  }
}

/**
 * Update a substrate action's status
 */
export async function updateSubstrateActionStatus(
  actionId: string,
  practiceId: string = DEMO_PRACTICE_ID,
  update: {
    status: "completed" | "dismissed" | "snoozed";
    reason?: string;
    snoozed_until?: string;
    completed_by?: string;
  }
): Promise<SubstrateActionRow | null> {
  const supabase = getUntypedClient();

  const updateData: Record<string, unknown> = {
    status: update.status,
    updated_at: new Date().toISOString(),
  };

  if (update.status === "completed") {
    updateData.completed_at = new Date().toISOString();
    if (update.completed_by) {
      updateData.completed_by = update.completed_by;
    }
  }

  if (update.status === "dismissed" && update.reason) {
    updateData.dismissed_reason = update.reason;
  }

  if (update.status === "snoozed" && update.snoozed_until) {
    updateData.snoozed_until = update.snoozed_until;
  }

  try {
    const { data, error } = await supabase
      .from("substrate_actions")
      .update(updateData)
      .eq("id", actionId)
      .eq("practice_id", practiceId)
      .select()
      .single();

    if (error) {
      log.error("Failed to update substrate action", error);
      return null;
    }

    return data as SubstrateActionRow;
  } catch (err) {
    log.error("substrate_actions table may not exist", { error: String(err) });
    return null;
  }
}

/**
 * Get substrate action counts by urgency
 */
export async function getSubstrateActionCounts(practiceId: string = DEMO_PRACTICE_ID): Promise<{
  urgent: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}> {
  const supabase = getUntypedClient();

  try {
    const { data, error } = await supabase
      .from("substrate_actions")
      .select("urgency")
      .eq("practice_id", practiceId)
      .eq("status", "active");

    if (error) {
      log.error("Failed to fetch action counts", error);
      return { urgent: 0, high: 0, medium: 0, low: 0, total: 0 };
    }

    const counts = {
      urgent: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: (data || []).length,
    };

    interface UrgencyRow {
      urgency: string;
    }

    (data || []).forEach((action: UrgencyRow) => {
      const urgency = action.urgency.toLowerCase() as keyof typeof counts;
      if (urgency in counts && urgency !== "total") {
        counts[urgency]++;
      }
    });

    return counts;
  } catch (err) {
    log.error("substrate_actions table may not exist", { error: String(err) });
    return { urgent: 0, high: 0, medium: 0, low: 0, total: 0 };
  }
}

/**
 * Complete all active actions for a patient
 */
export async function completeAllPatientSubstrateActions(
  patientId: string,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<number> {
  const supabase = getUntypedClient();

  try {
    const { data, error } = await supabase
      .from("substrate_actions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId)
      .eq("practice_id", practiceId)
      .eq("status", "active")
      .select();

    if (error) {
      log.error("Failed to complete patient actions", error);
      return 0;
    }

    return data?.length || 0;
  } catch (err) {
    log.error("substrate_actions table may not exist", { error: String(err) });
    return 0;
  }
}

/**
 * Update suggested action completion status within an action
 */
export async function toggleSuggestedAction(
  actionId: string,
  suggestedActionIndex: number,
  completed: boolean,
  practiceId: string = DEMO_PRACTICE_ID
): Promise<SubstrateActionRow | null> {
  const supabase = getUntypedClient();

  try {
    // Fetch current action
    const { data: action, error: fetchError } = await supabase
      .from("substrate_actions")
      .select("suggested_actions")
      .eq("id", actionId)
      .eq("practice_id", practiceId)
      .single();

    if (fetchError || !action) {
      log.error("Failed to fetch action for toggle", fetchError);
      return null;
    }

    const suggestedActions = (action.suggested_actions || []) as SuggestedActionPayload[];
    if (suggestedActionIndex >= 0 && suggestedActionIndex < suggestedActions.length) {
      const targetAction = suggestedActions[suggestedActionIndex];
      if (targetAction) {
        targetAction.completed = completed;
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from("substrate_actions")
      .update({ suggested_actions: suggestedActions })
      .eq("id", actionId)
      .eq("practice_id", practiceId)
      .select()
      .single();

    if (updateError) {
      log.error("Failed to toggle suggested action", updateError);
      return null;
    }

    return updated as SubstrateActionRow;
  } catch (err) {
    log.error("substrate_actions table may not exist", { error: String(err) });
    return null;
  }
}
