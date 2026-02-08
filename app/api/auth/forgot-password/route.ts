import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TOKEN_EXPIRY_HOURS = 1;

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

interface ForgotPasswordRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ForgotPasswordRequest;
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: user } = await supabase
      .from("users")
      .select("id, email, name, is_active")
      .eq("email", email.toLowerCase())
      .single();

    if (user && user.is_active) {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      });

      if (!tokenError) {
        const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
        console.info("[ForgotPassword] Reset token created:", {
          userId: user.id,
          email: user.email,
          expiresAt: expiresAt.toISOString(),
          resetUrl,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent a reset link.",
    });
  } catch (error) {
    console.error("[ForgotPassword] Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
