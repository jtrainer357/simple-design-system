/**
 * MFA Status API Route.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { authOptions } from "@/src/lib/auth/auth-options";
import { createLogger } from "@/src/lib/logger";

const log = createLogger("api/auth/mfa/status");
import type { MFAStatus } from "@/src/lib/auth/mfa/types";
import type { AuthUser } from "@/src/lib/auth/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as AuthUser | undefined;
    if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: mfaData } = await supabase
      .from("user_mfa")
      .select("is_enabled, enabled_at, backup_codes")
      .eq("user_id", user.id)
      .single();

    const { data: userData } = await supabase
      .from("users")
      .select("mfa_pending")
      .eq("id", user.id)
      .single();

    const status: MFAStatus = {
      isEnabled: mfaData?.is_enabled || false,
      isPending: userData?.mfa_pending || false,
      enabledAt: mfaData?.enabled_at || null,
      backupCodesRemaining: mfaData?.backup_codes?.length || 0,
    };

    return NextResponse.json(status);
  } catch (error: unknown) {
    log.error("MFA status error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
