// Client-side helper to call the admin CRUD API route
// This bypasses RLS by going through the service role key on the server

const ADMIN_FETCH_TIMEOUT_MS = 15_000;
const ADMIN_UPLOAD_TIMEOUT_MS = 30_000;

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

/**
 * Upload a file to the portfolio-images Supabase bucket via the server.
 * Server route uses the service-role key, so storage RLS doesn't block us.
 * @param file Browser File from an <input type="file" /> change event.
 * @param prefix Short tag for the filename (e.g. "project", "cert", "logo",
 *               "profile", "resume"). Non-alphanumeric chars are stripped.
 * @returns Public URL of the uploaded asset.
 * @throws Error with server-side message if upload fails.
 */
export async function uploadAdmin(file: File, prefix: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    ADMIN_UPLOAD_TIMEOUT_MS
  );
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prefix", prefix);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    return json.publicUrl as string;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Upload timed out after 30s — check file size and server logs"
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
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
