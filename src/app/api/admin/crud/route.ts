import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Generic admin CRUD route — uses service role key to bypass RLS
export async function POST(request: Request) {
  try {
    const { table, operation, data, id } = await request.json();
    const admin = getSupabaseAdmin();

    switch (operation) {
      case "insert": {
        const { data: result, error } = await admin
          .from(table)
          .insert(data)
          .select()
          .single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(result);
      }
      case "update": {
        const { error } = await admin.from(table).update(data).eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case "upsert": {
        const onConflict = data._onConflict || "id";
        const { _onConflict, ...upsertData } = data;
        void _onConflict;
        const { error } = await admin
          .from(table)
          .upsert(upsertData, { onConflict });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case "delete": {
        const { error } = await admin.from(table).delete().eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case "select": {
        const { data: result, error } = await admin.from(table).select("*").order("sort_order", { ascending: true });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
