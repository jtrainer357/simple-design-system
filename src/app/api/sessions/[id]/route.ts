import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data, error } = await supabase.from("session_notes").select("*").eq("id", id).single();
    if (error || !data) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    return NextResponse.json({ id: data.id, patientId: data.patient_id, providerId: data.provider_id, sessionDate: data.session_date, noteType: data.note_type, status: data.status, cptCode: data.cpt_code, subjective: data.subjective, objective: data.objective, assessment: data.assessment, plan: data.plan, signedAt: data.signed_at, isLateEntry: data.is_late_entry, lateEntryReason: data.late_entry_reason, lastAutoSavedAt: data.last_auto_saved_at, createdAt: data.created_at, updatedAt: data.updated_at });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: existing } = await supabase.from("session_notes").select("status, provider_id").eq("id", id).single();
    if (!existing) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (existing.provider_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (existing.status !== "draft") return NextResponse.json({ error: "Cannot update signed notes" }, { status: 400 });

    const updateData: Record<string, unknown> = { last_auto_saved_at: new Date().toISOString() };
    if (body.sessionDate !== undefined) updateData.session_date = body.sessionDate;
    if (body.noteType !== undefined) updateData.note_type = body.noteType;
    if (body.cptCode !== undefined) updateData.cpt_code = body.cptCode;
    if (body.subjective !== undefined) updateData.subjective = body.subjective;
    if (body.objective !== undefined) updateData.objective = body.objective;
    if (body.assessment !== undefined) updateData.assessment = body.assessment;
    if (body.plan !== undefined) updateData.plan = body.plan;

    const { data, error } = await supabase.from("session_notes").update(updateData).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    return NextResponse.json({ id: data.id, patientId: data.patient_id, status: data.status, lastAutoSavedAt: data.last_auto_saved_at, updatedAt: data.updated_at });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
