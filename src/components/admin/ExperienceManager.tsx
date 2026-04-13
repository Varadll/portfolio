"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  fetchExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/supabase-portfolio";
import type { Experience } from "@/types/portfolio";

interface Props {
  onMutate: () => Promise<void>;
}

interface FormData {
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string;
  description_html: string;
  tech_used: string;
  type: Experience["type"];
  sort_order: number;
}

const EMPTY_FORM: FormData = {
  company: "",
  role: "",
  location: "",
  start_date: "",
  end_date: "",
  description_html: "",
  tech_used: "",
  type: "fulltime",
  sort_order: 0,
};

export default function ExperienceManager({ onMutate }: Props) {
  const [items, setItems] = useState<Experience[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchExperience());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setViewMode("form");
  };

  const openEdit = (exp: Experience) => {
    setEditingId(exp.id);
    setForm({
      company: exp.company,
      role: exp.role,
      location: exp.location || "",
      start_date: exp.start_date,
      end_date: exp.end_date || "",
      description_html: exp.description_html || "",
      tech_used: exp.tech_used.join(", "),
      type: exp.type,
      sort_order: exp.sort_order,
    });
    setViewMode("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        company: form.company,
        role: form.role,
        location: form.location || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        description_html: form.description_html || null,
        tech_used: form.tech_used
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        type: form.type,
        sort_order: form.sort_order,
      };

      if (editingId) {
        await updateExperience(editingId, payload);
      } else {
        await createExperience(payload);
      }

      await onMutate();
      await load();
      setViewMode("list");
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await deleteExperience(id);
    await onMutate();
    await load();
  };

  if (viewMode === "form") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">
            {editingId ? "Edit Experience" : "New Experience"}
          </h2>
          <button onClick={() => setViewMode("list")} className="text-muted hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Role *</label>
              <input
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Company *</label>
              <input
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Experience["type"] }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="fulltime">Full-time</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">End Date (blank = present)</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Description (HTML)</label>
            <textarea
              rows={4}
              value={form.description_html}
              onChange={(e) => setForm((f) => ({ ...f, description_html: e.target.value }))}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary font-mono focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">Tech Used (comma-separated)</label>
            <input
              value={form.tech_used}
              onChange={(e) => setForm((f) => ({ ...f, tech_used: e.target.value }))}
              placeholder="React, Node.js, PostgreSQL"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? "Update" : "Create"}
            </Button>
            <Button variant="ghost" onClick={() => setViewMode("list")}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary">Experience ({items.length})</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> Add Experience
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 text-muted">No experience entries yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((exp) => (
            <div key={exp.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-primary">{exp.role}</h3>
                <p className="text-sm text-muted">
                  {exp.company} · {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : "Present"}
                </p>
              </div>
              <Badge variant="accent" className="capitalize shrink-0">{exp.type}</Badge>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(exp)} className="p-1.5 text-muted hover:text-primary rounded-md hover:bg-secondary">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
