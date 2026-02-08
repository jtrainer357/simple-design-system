import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/sessions/unsigned-count - Get count of unsigned notes for current user
 * This endpoint is used by EPSILON substrate for the home page widget
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count, error } = await supabase
      .from("session_notes")
      .select("*", { count: "exact", head: true })
      .eq("provider_id", user.id)
      .eq("status", "draft");

    if (error) {
      console.error("Error fetching unsigned count:", error);
      return NextResponse.json({ error: "Failed to fetch unsigned count" }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("Unsigned count API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
