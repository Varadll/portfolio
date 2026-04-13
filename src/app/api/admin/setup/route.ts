import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// One-time setup: makes the first user with a matching email an admin.
// Uses service role to bypass RLS.
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Find the user by email
    const { data: users, error: listError } = await admin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const user = users.users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Upsert the profile with admin role
    const { error: upsertError } = await admin
      .from("profiles")
      .upsert({ id: user.id, role: "admin" }, { onConflict: "id" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
