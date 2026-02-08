import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/src/lib/logger";
import { logSecurityEvent } from "@/src/lib/audit";

const log = createLogger("api/auth/reset-password");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    if (!token || !password)
      return NextResponse.json({ error: "Token and password required" }, { status: 400 });
    if (password.length < 12)
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 }
      );
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    const { data: resetToken, error } = await supabase
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used")
      .eq("token", token)
      .single();
    if (error || !resetToken)
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    if (resetToken.used) return NextResponse.json({ error: "Link already used" }, { status: 400 });
    if (new Date(resetToken.expires_at) < new Date())
      return NextResponse.json({ error: "Link expired" }, { status: 400 });
    const passwordHash = await hashPassword(password);
    await supabase
      .from("users")
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq("id", resetToken.user_id);
    await supabase.from("password_reset_tokens").update({ used: true }).eq("id", resetToken.id);

    // Audit log for password change completion
    await logSecurityEvent("password_change", {
      userId: resetToken.user_id,
      details: { event: "password_reset_completed" },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    log.error("Reset password error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
