import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/src/lib/logger";
import { logSecurityEvent } from "@/src/lib/audit";

const log = createLogger("api/auth/forgot-password");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ success: true });
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
    const { data: user } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("email", email.toLowerCase())
      .single();
    if (!user) return NextResponse.json({ success: true });
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
      created_at: new Date().toISOString(),
    });

    // Audit log for password reset request
    await logSecurityEvent("password_change", {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      details: { event: "password_reset_requested" },
    });

    log.info("Reset link generated", { userId: user.id });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    log.error("Forgot password error", error);
    return NextResponse.json({ success: true });
  }
}
