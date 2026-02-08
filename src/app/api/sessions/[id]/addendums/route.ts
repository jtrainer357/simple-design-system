import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/sessions/[id]/addendums - Get addendums for a session
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("session_addendums")
      .select("*")
      .eq("session_note_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching addendums:", error);
      return NextResponse.json(
        { error: "Failed to fetch addendums" },
        { status: 500 }
      );
    }

    const addendums = data.map((addendum) => ({
      id: addendum.id,
      sessionNoteId: addendum.session_note_id,
      authorId: addendum.author_id,
      content: addendum.content,
      reason: addendum.reason,
      signedAt: addendum.signed_at,
      signatureHash: addendum.signature_hash,
      createdAt: addendum.created_at,
    }));

    return NextResponse.json(addendums);
  } catch (error) {
    console.error("Addendums GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions/[id]/addendums - Create an addendum
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

    // Check if note exists and is signed
    const { data: session } = await supabase
      .from("session_notes")
      .select("status, provider_id")
      .eq("id", id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.provider_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.status !== "signed") {
      return NextResponse.json(
        { error: "Can only add addendums to signed notes" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "Addendum content is required" },
        { status: 400 }
      );
    }

    if (!body.reason?.trim()) {
      return NextResponse.json(
        { error: "Addendum reason is required" },
        { status: 400 }
      );
    }

    // Create signature hash for addendum
    const signedAt = new Date().toISOString();
    const signatureContent = JSON.stringify({
      sessionId: id,
      userId: user.id,
      content: body.content,
      reason: body.reason,
      timestamp: signedAt,
    });

    const signatureHash = createHash("sha256")
      .update(signatureContent)
      .digest("hex");

    const { data, error } = await supabase
      .from("session_addendums")
      .insert({
        session_note_id: id,
        author_id: user.id,
        content: body.content.trim(),
        reason: body.reason.trim(),
        signed_at: signedAt,
        signature_hash: signatureHash,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating addendum:", error);
      return NextResponse.json(
        { error: "Failed to create addendum" },
        { status: 500 }
      );
    }

    // Update session status to amended
    await supabase
      .from("session_notes")
      .update({ status: "amended" })
      .eq("id", id);

    return NextResponse.json({
      id: data.id,
      sessionNoteId: data.session_note_id,
      authorId: data.author_id,
      content: data.content,
      reason: data.reason,
      signedAt: data.signed_at,
      signatureHash: data.signature_hash,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error("Addendums POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
