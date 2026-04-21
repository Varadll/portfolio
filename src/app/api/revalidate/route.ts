import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { revalidatePath } from "next/cache";

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
    } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("[revalidate] ADMIN_EMAIL env var not set");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }
    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "/";

    revalidatePath(path);
    // Also invalidate the project detail segment so edits propagate in prod
    if (path === "/projects" || path === "/") {
      revalidatePath("/projects/[slug]", "page");
    }

    return NextResponse.json({ revalidated: true, path });
  } catch (err) {
    console.error("[revalidate] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Revalidation failed" },
      { status: 500 }
    );
  }
}
