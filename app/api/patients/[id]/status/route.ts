/**
 * Patient Status API Route
 * PATCH /api/patients/[id]/status - Update patient status with audit trail
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logAudit } from "@/src/lib/audit";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("PatientStatusAPI");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

type PatientStatus = "Active" | "Inactive" | "Discharged";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/patients/[id]/status
 * Updates patient status (Active, Inactive, Discharged)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, reason, practiceId } = body;

    // Validate required fields
    if (!practiceId) {
      return NextResponse.json({ error: "practiceId is required" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    // Validate status value
    const validStatuses: PatientStatus[] = ["Active", "Inactive", "Discharged"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // Get current patient for audit log
    const { data: currentPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .eq("practice_id", practiceId)
      .single();

    if (!currentPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Don't update if status is the same
    if (currentPatient.status === status) {
      return NextResponse.json({ patient: currentPatient });
    }

    // Update status
    const { data: patient, error } = await supabase
      .from("patients")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("practice_id", practiceId)
      .select()
      .single();

    if (error) {
      log.error("Failed to update patient status", error);
      return NextResponse.json({ error: "Failed to update patient status" }, { status: 500 });
    }

    // Audit log for status change (considered sensitive for Discharged)
    await logAudit({
      action: "update",
      resourceType: "patient",
      resourceId: id,
      practiceId,
      oldValues: { status: currentPatient.status },
      newValues: { status },
      details: {
        statusChange: { from: currentPatient.status, to: status },
        reason: reason || null,
      },
      isSensitive: status === "Discharged",
    });

    return NextResponse.json({ patient });
  } catch (error: unknown) {
    log.error("Status update error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
