import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase";

// Generic admin CRUD route — uses service role key to bypass RLS
export async function POST(request: Request) {
  try {
    // Verify the caller is an authenticated admin before using the service role
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Route handlers can set cookies but we do not need to refresh here
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user) {
      console.error("[admin/crud] unauthenticated", userError);
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profileError || profile?.role !== "admin") {
      console.error("[admin/crud] forbidden", user.email, profileError);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { table, operation, data, id } = await request.json();

    switch (operation) {
      case "insert": {
        const { data: result, error } = await admin
          .from(table)
          .insert(data)
          .select()
          .single();
        if (error) {
          console.error("[admin/crud] insert", table, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json(result);
      }
      case "update": {
        const { error } = await admin.from(table).update(data).eq("id", id);
        if (error) {
          console.error("[admin/crud] update", table, id, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }
      case "upsert": {
        const onConflict = data._onConflict || "id";
        const { _onConflict, ...upsertData } = data;
        void _onConflict;
        const { error } = await admin
          .from(table)
          .upsert(upsertData, { onConflict });
        if (error) {
          console.error("[admin/crud] upsert", table, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }
      case "delete": {
        const { error } = await admin.from(table).delete().eq("id", id);
        if (error) {
          console.error("[admin/crud] delete", table, id, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ success: true });
      }
      case "select": {
        const { data: result, error } = await admin
          .from(table)
          .select("*")
          .order("sort_order", { ascending: true });
        if (error) {
          console.error("[admin/crud] select", table, error);
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch (err) {
    console.error("[admin/crud] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
