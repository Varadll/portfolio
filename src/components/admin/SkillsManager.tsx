"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/supabase-portfolio";
import type { Skill } from "@/types/portfolio";

interface Props {
  onMutate: () => Promise<void>;
}

interface FormData {
  name: string;
  category: Skill["category"];
  icon_name: string;
  proficiency: number;
  sort_order: number;
}

const EMPTY_FORM: FormData = {
  name: "",
  category: "frontend",
  icon_name: "",
  proficiency: 3,
  sort_order: 0,
};

const CATEGORIES: Skill["category"][] = [
  "frontend",
  "backend",
  "database",
  "tools",
  "languages",
  "other",
];

export default function SkillsManager({ onMutate }: Props) {
  const [items, setItems] = useState<Skill[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await fetchSkills()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setViewMode("form"); };
  const openEdit = (s: Skill) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      category: s.category,
      icon_name: s.icon_name || "",
      proficiency: s.proficiency,
      sort_order: s.sort_order,
    });
    setViewMode("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        icon_name: form.icon_name || null,
        proficiency: form.proficiency,
        sort_order: form.sort_order,
      };
      if (editingId) {
        await updateSkill(editingId, payload);
      } else {
        await createSkill(payload);
      }
      await onMutate();
      await load();
      setViewMode("list");
    } catch (e) { console.error(e); alert("Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    await deleteSkill(id);
    await onMutate();
    await load();
  };

  if (viewMode === "form") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">{editingId ? "Edit" : "New"} Skill</h2>
          <button onClick={() => setViewMode("list")} className="text-muted hover:text-primary"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., React, Node.js, PostgreSQL" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Skill["category"] }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Proficiency (1-5)</label>
            <input type="range" min={1} max={5} value={form.proficiency} onChange={(e) => setForm((f) => ({ ...f, proficiency: parseInt(e.target.value) }))} className="w-full accent-accent" />
            <div className="flex justify-between text-xs text-muted">
              <span>Beginner</span><span>Intermediate</span><span>Expert</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
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

  // Group by category for display
  const grouped = items.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary">Skills ({items.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus size={16} /> Add Skill</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 text-muted">No skills yet.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, skills]) => (
            <div key={cat}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-2 capitalize">{cat}</h3>
              <div className="space-y-2">
                {skills.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <span className="text-sm font-medium text-primary">{s.name}</span>
                      <Badge variant="outline">{s.proficiency * 20}%</Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-muted hover:text-primary rounded-md hover:bg-secondary"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
