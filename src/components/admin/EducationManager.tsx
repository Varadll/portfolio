"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import {
  fetchEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from "@/lib/supabase-portfolio";
import type { Education } from "@/types/portfolio";

interface Props {
  onMutate: () => Promise<void>;
}

interface FormData {
  institution: string;
  degree: string;
  field: string;
  start_year: number;
  end_year: string;
  description: string;
  sort_order: number;
}

const EMPTY_FORM: FormData = {
  institution: "",
  degree: "",
  field: "",
  start_year: new Date().getFullYear(),
  end_year: "",
  description: "",
  sort_order: 0,
};

export default function EducationManager({ onMutate }: Props) {
  const [items, setItems] = useState<Education[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchEducation());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setViewMode("form"); };
  const openEdit = (edu: Education) => {
    setEditingId(edu.id);
    setForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field || "",
      start_year: edu.start_year,
      end_year: edu.end_year?.toString() || "",
      description: edu.description || "",
      sort_order: edu.sort_order,
    });
    setViewMode("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        institution: form.institution,
        degree: form.degree,
        field: form.field || null,
        start_year: form.start_year,
        end_year: form.end_year ? parseInt(form.end_year) : null,
        description: form.description || null,
        sort_order: form.sort_order,
      };
      if (editingId) {
        await updateEducation(editingId, payload);
      } else {
        await createEducation(payload);
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
    await deleteEducation(id);
    await onMutate();
    await load();
  };

  if (viewMode === "form") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">{editingId ? "Edit" : "New"} Education</h2>
          <button onClick={() => setViewMode("list")} className="text-muted hover:text-primary"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Institution *</label>
            <input value={form.institution} onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Degree *</label>
              <input value={form.degree} onChange={(e) => setForm((f) => ({ ...f, degree: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Field of Study</label>
              <input value={form.field} onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Start Year *</label>
              <input type="number" value={form.start_year} onChange={(e) => setForm((f) => ({ ...f, start_year: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">End Year</label>
              <input type="number" value={form.end_year} onChange={(e) => setForm((f) => ({ ...f, end_year: e.target.value }))} placeholder="Blank = ongoing" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent resize-none" />
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
        <h2 className="text-lg font-semibold text-primary">Education ({items.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus size={16} /> Add Education</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 text-muted">No education entries yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((edu) => (
            <div key={edu.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-primary">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</h3>
                <p className="text-sm text-muted">{edu.institution} · {edu.start_year} — {edu.end_year || "Present"}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(edu)} className="p-1.5 text-muted hover:text-primary rounded-md hover:bg-secondary"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(edu.id)} className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
