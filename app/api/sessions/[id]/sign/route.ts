import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { createHash } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/sessions/[id]/sign - Sign and lock a session note
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the session note
    const { data: session } = await supabase
      .from("session_notes")
      .select("*")
      .eq("id", id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.provider_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.status === "signed") {
      return NextResponse.json({ error: "Note is already signed" }, { status: 400 });
    }

    // Validate required fields before signing
    if (!session.subjective && !session.objective && !session.assessment) {
      return NextResponse.json({ error: "Note must have content before signing" }, { status: 400 });
    }

    // Create signature hash
    const signatureContent = JSON.stringify({
      sessionId: id,
      userId: user.id,
      signature: body.signature,
      timestamp: new Date().toISOString(),
      noteContent: {
        subjective: session.subjective,
        objective: session.objective,
        assessment: session.assessment,
        plan: session.plan,
      },
    });

    const signatureHash = createHash("sha256").update(signatureContent).digest("hex");

    const signedAt = new Date().toISOString();

    // Update the note to signed status
    const { data, error } = await supabase
      .from("session_notes")
      .update({
        status: "signed",
        signed_at: signedAt,
        signed_by: user.id,
        signature_hash: signatureHash,
        is_late_entry: body.isLateEntry || false,
        late_entry_reason: body.lateEntryReason || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error signing session:", error);
      return NextResponse.json({ error: "Failed to sign session" }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      patientId: data.patient_id,
      providerId: data.provider_id,
      sessionDate: data.session_date,
      noteType: data.note_type,
      status: data.status,
      signedAt: data.signed_at,
      signedBy: data.signed_by,
      isLateEntry: data.is_late_entry,
      lateEntryReason: data.late_entry_reason,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("Session sign API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
