// Client-side helper to call the admin CRUD API route
// This bypasses RLS by going through the service role key on the server

import { supabase } from "@/lib/supabase";

const ADMIN_FETCH_TIMEOUT_MS = 15_000;
const UPLOAD_BUCKET = "portfolio-images";

async function adminFetch(body: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch("/api/admin/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    return json;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Request timed out after 15s — check server logs and Supabase status"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function sanitizePrefix(prefix: string): string {
  const cleaned = prefix.replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned || "upload";
}

function sanitizeExt(name: string): string {
  const ext = name.split(".").pop() ?? "";
  return ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

/**
 * Upload a file directly from the browser to the portfolio-images Supabase
 * bucket. Requires an RLS INSERT policy on storage.objects that allows
 * authenticated users to write to this bucket (see supabase-migrations/
 * 004-storage-insert-policy.sql). This avoids Netlify Function payload limits.
 * @param file Browser File from an <input type="file" /> change event.
 * @param prefix Short tag for the filename (e.g. "project", "cert", "logo",
 *               "profile", "resume"). Non-alphanumeric chars are stripped.
 * @returns Public URL of the uploaded asset.
 * @throws Error with Supabase error message if upload fails.
 */
export async function uploadAdmin(file: File, prefix: string): Promise<string> {
  const fileName = `${sanitizePrefix(prefix)}-${Date.now()}.${sanitizeExt(file.name)}`;
  const { error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(fileName, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export const adminDb = {
  async insert(table: string, data: Record<string, unknown>) {
    return adminFetch({ table, operation: "insert", data });
  },
  async update(table: string, id: string, data: Record<string, unknown>) {
    return adminFetch({ table, operation: "update", id, data });
  },
  async upsert(table: string, data: Record<string, unknown>, onConflict = "id") {
    return adminFetch({ table, operation: "upsert", data: { ...data, _onConflict: onConflict } });
  },
  async remove(table: string, id: string) {
    return adminFetch({ table, operation: "delete", id });
  },
  async select(table: string) {
    return adminFetch({ table, operation: "select" });
  },
};
