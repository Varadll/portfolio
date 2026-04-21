"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, X, Save, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { uploadAdmin } from "@/lib/admin-client";
import {
  fetchCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
} from "@/lib/supabase-portfolio";
import type { Certification } from "@/types/portfolio";

interface Props {
  onMutate: () => Promise<void>;
}

interface FormData {
  name: string;
  issuer: string;
  issue_date: string;
  credential_url: string;
  badge_image_url: string;
  sort_order: number;
}

const EMPTY_FORM: FormData = {
  name: "",
  issuer: "",
  issue_date: "",
  credential_url: "",
  badge_image_url: "",
  sort_order: 0,
};

export default function CertificationManager({ onMutate }: Props) {
  const [items, setItems] = useState<Certification[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const publicUrl = await uploadAdmin(file, "cert");
      setForm((f) => ({ ...f, badge_image_url: publicUrl }));
    } catch (err) {
      console.error("[CertificationManager] badge upload failed", err);
      alert(
        "Upload failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
    setUploading(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await fetchCertifications()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setViewMode("form"); };
  const openEdit = (cert: Certification) => {
    setEditingId(cert.id);
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      issue_date: cert.issue_date || "",
      credential_url: cert.credential_url || "",
      badge_image_url: cert.badge_image_url || "",
      sort_order: cert.sort_order,
    });
    setViewMode("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        issuer: form.issuer,
        issue_date: form.issue_date || null,
        credential_url: form.credential_url || null,
        badge_image_url: form.badge_image_url || null,
        sort_order: form.sort_order,
      };
      if (editingId) {
        await updateCertification(editingId, payload);
      } else {
        await createCertification(payload);
      }
      await onMutate();
      await load();
      setViewMode("list");
    } catch (e) { console.error(e); alert("Failed to save"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certification?")) return;
    await deleteCertification(id);
    await onMutate();
    await load();
  };

  if (viewMode === "form") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">{editingId ? "Edit" : "New"} Certification</h2>
          <button onClick={() => setViewMode("list")} className="text-muted hover:text-primary"><X size={20} /></button>
        </div>
        <div className="space-y-4 max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Issuer *</label>
              <input value={form.issuer} onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Issue Date</label>
              <input type="date" value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Credential URL</label>
            <input value={form.credential_url} onChange={(e) => setForm((f) => ({ ...f, credential_url: e.target.value }))} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Badge Image</label>
            <div className="flex items-center gap-4">
              {form.badge_image_url && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                  <Image src={form.badge_image_url} alt="Badge" fill className="object-contain" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted hover:border-accent hover:text-accent transition-colors"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? "Uploading..." : form.badge_image_url ? "Change Image" : "Upload Image"}
                </button>
              </div>
            </div>
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
        <h2 className="text-lg font-semibold text-primary">Certifications ({items.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus size={16} /> Add Certification</Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
      ) : items.length === 0 ? (
        <p className="text-center py-12 text-muted">No certifications yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((cert) => (
            <div key={cert.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              {cert.badge_image_url && (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border">
                  <Image src={cert.badge_image_url} alt={cert.name} fill className="object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-primary">{cert.name}</h3>
                <p className="text-sm text-muted">{cert.issuer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(cert)} className="p-1.5 text-muted hover:text-primary rounded-md hover:bg-secondary"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(cert.id)} className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
