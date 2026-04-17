import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — stores auth session in cookies so server route handlers
// (which read cookies via @supabase/ssr) can see the logged-in user.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server/admin client — only use in server-side code (API routes, server components)
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not available");
  }
  return createClient(supabaseUrl, serviceRoleKey);
}
