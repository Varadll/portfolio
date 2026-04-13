import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Browser client — uses anon key, respects RLS policies
// Lazy-initialize to avoid crash when env vars aren't loaded yet
let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const key = supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      if (!url || !key) {
        // Return a no-op client that won't crash
        console.warn("Supabase credentials not found — using placeholder client");
        _supabase = createClient("https://placeholder.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder");
      } else {
        _supabase = createClient(url, key);
      }
    }
    return (_supabase as Record<string, unknown>)[prop as string];
  },
});

// Server/admin client — only use in server-side code (API routes, server components)
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not available");
  }
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return createClient(url, serviceRoleKey);
}
