import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: new Date().toISOString(),
      });
    console.info("[ForgotPassword] Reset link generated:", {
      userId: user.id,
      email: user.email,
      expiresAt: expiresAt.toISOString(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ForgotPassword] Error:", error);
    return NextResponse.json({ success: true });
  }
}
