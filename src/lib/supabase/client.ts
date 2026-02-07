/**
 * Supabase Browser Client
 * For client-side Supabase operations
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let client: BrowserClient | null = null;

export function createClient(): BrowserClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}

// Re-export for convenience
export type { Database };
