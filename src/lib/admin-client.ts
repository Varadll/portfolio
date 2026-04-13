// Client-side helper to call the admin CRUD API route
// This bypasses RLS by going through the service role key on the server

async function adminFetch(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/crud", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
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
