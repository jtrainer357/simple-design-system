import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");
    const noteType = searchParams.get("noteType");

    let query = supabase.from("session_notes").select("*").order("session_date", { ascending: false });
    if (patientId) query = query.eq("patient_id", patientId);
    if (status) query = query.eq("status", status);
    if (noteType) query = query.eq("note_type", noteType);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });

    const sessions = data.map((s) => ({ id: s.id, patientId: s.patient_id, providerId: s.provider_id, sessionDate: s.session_date, noteType: s.note_type, status: s.status, cptCode: s.cpt_code, subjective: s.subjective, objective: s.objective, assessment: s.assessment, plan: s.plan, signedAt: s.signed_at, isLateEntry: s.is_late_entry, createdAt: s.created_at, updatedAt: s.updated_at }));
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase.from("session_notes").insert({ patient_id: body.patientId, provider_id: user.id, session_date: body.sessionDate || new Date().toISOString().split("T")[0], note_type: body.noteType || "progress_note", status: "draft", cpt_code: body.cptCode, subjective: body.subjective, objective: body.objective, assessment: body.assessment, plan: body.plan }).select().single();

    if (error) return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    return NextResponse.json({ id: data.id, patientId: data.patient_id, providerId: data.provider_id, sessionDate: data.session_date, noteType: data.note_type, status: data.status, createdAt: data.created_at });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
