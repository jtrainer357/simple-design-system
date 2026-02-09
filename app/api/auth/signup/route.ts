import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/src/lib/logger";
import { logAudit } from "@/src/lib/audit";

const log = createLogger("api/auth/signup");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface SignupRequest {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  password: string;
  practiceName: string;
  specialty: string;
  state: string;
  phone?: string;
  npi?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SignupRequest;
    const {
      firstName,
      lastName,
      fullName: providedFullName,
      email,
      password,
      practiceName,
      specialty,
      state,
      phone,
      npi,
    } = body;

    // Support both fullName OR firstName+lastName
    const fullName =
      providedFullName || (firstName && lastName ? `${firstName} ${lastName}` : null);

    if (!fullName || !email || !password || !practiceName || !specialty || !state) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
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

    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { data: practice, error: practiceError } = await supabase
      .from("practices")
      .insert({
        name: practiceName,
        settings: {
          specialty,
          state,
          phone: phone || null,
          npi: npi || null,
          is_active: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, name")
      .single();

    if (practiceError) {
      log.error("Practice creation failed", practiceError);
      return NextResponse.json({ error: "Failed to create practice" }, { status: 500 });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name: fullName,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, email, name")
      .single();

    if (userError) {
      log.error("User creation failed", userError);
      await supabase.from("practices").delete().eq("id", practice.id);
      return NextResponse.json({ error: "Failed to create user account" }, { status: 500 });
    }

    const { error: membershipError } = await supabase.from("practice_users").insert({
      user_id: user.id,
      practice_id: practice.id,
      role: "owner",
      is_active: true,
      accepted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (membershipError) {
      log.error("Membership creation failed", membershipError);
      await supabase.from("users").delete().eq("id", user.id);
      await supabase.from("practices").delete().eq("id", practice.id);
      return NextResponse.json({ error: "Failed to set up practice membership" }, { status: 500 });
    }

    log.info("Account created successfully", {
      userId: user.id,
      practiceId: practice.id,
    });

    // Audit log for account creation
    await logAudit({
      action: "create",
      resourceType: "user",
      resourceId: user.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      practiceId: practice.id,
      practiceName: practice.name,
      details: {
        event: "account_signup",
        specialty,
        state,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: { id: user.id, email: user.email, name: user.name },
        practice: { id: practice.id, name: practice.name },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    log.error("Signup error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
