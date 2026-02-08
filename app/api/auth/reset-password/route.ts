import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResetPasswordRequest;
    const { token, password } = body;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: tokenRecord, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used_at")
      .eq("token", token)
      .single();

    if (tokenError || !tokenRecord) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    if (tokenRecord.used_at) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 }
      );
    }

    const expiresAt = new Date(tokenRecord.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tokenRecord.user_id);

    if (updateError) {
      console.error("[ResetPassword] Password update failed:", updateError);
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    await supabase
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRecord.id);

    await supabase
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("user_id", tokenRecord.user_id)
      .is("used_at", null);

    console.info("[ResetPassword] Password reset successful:", {
      userId: tokenRecord.user_id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("[ResetPassword] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
