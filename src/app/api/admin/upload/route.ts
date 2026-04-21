import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase";

// Server-side upload route. Uses the service-role Supabase client so uploads
// bypass storage RLS (the portfolio-images bucket only has a public SELECT
// policy). Auth-gated by cookie-session + ADMIN_EMAIL check so only the
// portfolio owner can write.
const BUCKET = "portfolio-images";
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function sanitizePrefix(prefix: string): string {
  // Keep alphanumerics + dash/underscore. Prevents path traversal / weird keys.
  const cleaned = prefix.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "upload";
}

function sanitizeExt(name: string): string {
  const ext = name.split(".").pop() ?? "";
  const cleaned = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned || "bin";
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user) {
      console.error("[admin/upload] unauthenticated", userError);
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("[admin/upload] ADMIN_EMAIL not set");
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_EMAIL not set" },
        { status: 500 }
      );
    }
    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
      console.error("[admin/upload] forbidden", user.email);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const prefix = (formData.get("prefix") as string) || "upload";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing file in form data" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
        { status: 413 }
      );
    }

    const safePrefix = sanitizePrefix(prefix);
    const ext = sanitizeExt(file.name);
    const fileName = `${safePrefix}-${Date.now()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || "application/octet-stream";

    const admin = getSupabaseAdmin();
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(fileName, buffer, {
        contentType,
        upsert: false,
      });
    if (uploadError) {
      console.error("[admin/upload] storage upload failed", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ publicUrl, fileName });
  } catch (err) {
    console.error("[admin/upload] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
