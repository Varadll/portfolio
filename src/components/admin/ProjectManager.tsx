"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn, slugify } from "@/lib/utils";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/supabase-portfolio";
import { uploadAdmin } from "@/lib/admin-client";
import type { Project } from "@/types/portfolio";

interface Props {
  onMutate: () => Promise<void>;
}

type ViewMode = "list" | "form";

interface FormData {
  title: string;
  slug: string;
  tagline: string;
  description_html: string;
  tech_stack: string;
  image_url: string;
  gallery_urls: string;
  live_url: string;
  github_url: string;
  featured: boolean;
  status: "draft" | "published";
  completion_status: "completed" | "in_progress";
  sort_order: number;
  client_name: string;
  client_logo_url: string;
  testimonial_quote: string;
  testimonial_author: string;
  testimonial_author_role: string;
  acknowledgement_html: string;
}

const EMPTY_FORM: FormData = {
  title: "",
  slug: "",
  tagline: "",
  description_html: "",
  tech_stack: "",
  image_url: "",
  gallery_urls: "",
  live_url: "",
  github_url: "",
  featured: true,
  status: "published",
  completion_status: "completed",
  sort_order: 0,
  client_name: "",
  client_logo_url: "",
  testimonial_quote: "",
  testimonial_author: "",
  testimonial_author_role: "",
  acknowledgement_html: "",
};

export default function ProjectManager({ onMutate }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects(false);
      setProjects(data);
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

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      tagline: p.tagline || "",
      description_html: p.description_html,
      tech_stack: p.tech_stack.join(", "),
      image_url: p.image_url || "",
      gallery_urls: (p.gallery_urls || []).join("\n"),
      live_url: p.live_url || "",
      github_url: p.github_url || "",
      featured: p.featured,
      status: p.status,
      completion_status: p.completion_status || "completed",
      sort_order: p.sort_order,
      client_name: p.client_name || "",
      client_logo_url: p.client_logo_url || "",
      testimonial_quote: p.testimonial_quote || "",
      testimonial_author: p.testimonial_author || "",
      testimonial_author_role: p.testimonial_author_role || "",
      acknowledgement_html: p.acknowledgement_html || "",
    });
    setViewMode("form");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        tagline: form.tagline,
        description_html: form.description_html,
        tech_stack: form.tech_stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        image_url: form.image_url || null,
        gallery_urls: form.gallery_urls
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        live_url: form.live_url || null,
        github_url: form.github_url || null,
        featured: form.featured,
        status: form.status,
        completion_status: form.completion_status,
        sort_order: form.sort_order,
        client_name: form.client_name || null,
        client_logo_url: form.client_logo_url || null,
        testimonial_quote: form.testimonial_quote || null,
        testimonial_author: form.testimonial_author || null,
        testimonial_author_role: form.testimonial_author_role || null,
        acknowledgement_html: form.acknowledgement_html || null,
      };

      if (editingId) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload as Parameters<typeof createProject>[0]);
      }

      await onMutate();
      await load();
      setViewMode("list");
    } catch (e) {
      console.error(e);
      alert("Failed to save project");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      await onMutate();
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const publicUrl = await uploadAdmin(file, "project");
      setForm((f) => ({ ...f, image_url: publicUrl }));
    } catch (err) {
      console.error("[ProjectManager] cover upload failed", err);
      alert(
        "Upload failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleClientLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const publicUrl = await uploadAdmin(file, "client-logo");
      setForm((f) => ({ ...f, client_logo_url: publicUrl }));
    } catch (err) {
      console.error("[ProjectManager] client logo upload failed", err);
      alert(
        "Upload failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  if (viewMode === "form") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary">
            {editingId ? "Edit Project" : "New Project"}
          </h2>
          <button
            onClick={() => setViewMode("list")}
            className="text-muted hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Title *
              </label>
              <input
                value={form.title}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: editingId ? f.slug : slugify(e.target.value),
                  }));
                }}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Tagline
            </label>
            <input
              value={form.tagline}
              onChange={(e) =>
                setForm((f) => ({ ...f, tagline: e.target.value }))
              }
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Description (HTML)
            </label>
            <textarea
              rows={6}
              value={form.description_html}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_html: e.target.value }))
              }
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary font-mono focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Tech Stack (comma-separated)
            </label>
            <input
              value={form.tech_stack}
              onChange={(e) =>
                setForm((f) => ({ ...f, tech_stack: e.target.value }))
              }
              placeholder="Next.js, React, Supabase, Tailwind CSS"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Cover Image
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-secondary file:text-primary hover:file:bg-border"
              />
              {form.image_url && (
                <div className="relative h-16 w-24 overflow-hidden rounded border border-border">
                  <Image
                    src={form.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <input
              value={form.image_url}
              onChange={(e) =>
                setForm((f) => ({ ...f, image_url: e.target.value }))
              }
              placeholder="Or paste image URL directly"
              className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Live URL
              </label>
              <input
                value={form.live_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, live_url: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                GitHub URL
              </label>
              <input
                value={form.github_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, github_url: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as "draft" | "published",
                  }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sort_order: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-sm text-primary">Featured</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Completion Status
            </label>
            <div className="inline-flex rounded-lg border border-border bg-card p-1">
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, completion_status: "completed" }))
                }
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  form.completion_status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "text-muted hover:text-primary"
                )}
              >
                Completed
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, completion_status: "in_progress" }))
                }
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  form.completion_status === "in_progress"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : "text-muted hover:text-primary"
                )}
              >
                In Development
              </button>
            </div>
            <p className="mt-1 text-xs text-muted">
              Shown as a badge on project cards and the detail page.
            </p>
          </div>

          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Client &amp; Testimonial
            </h3>
            <p className="text-xs text-muted">
              Optional. Shown on the project detail page. Leave blank to hide.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Client Name
                </label>
                <input
                  value={form.client_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, client_name: e.target.value }))
                  }
                  placeholder="Acme Inc."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Client Logo
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleClientLogoUpload}
                    className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-secondary file:text-primary hover:file:bg-border"
                  />
                  {form.client_logo_url && (
                    <div className="relative h-10 w-10 overflow-hidden rounded border border-border bg-white">
                      <Image
                        src={form.client_logo_url}
                        alt="Client logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Testimonial Quote
              </label>
              <textarea
                rows={3}
                value={form.testimonial_quote}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    testimonial_quote: e.target.value,
                  }))
                }
                placeholder="Their work exceeded our expectations…"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Testimonial Author
                </label>
                <input
                  value={form.testimonial_author}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      testimonial_author: e.target.value,
                    }))
                  }
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">
                  Author Role
                </label>
                <input
                  value={form.testimonial_author_role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      testimonial_author_role: e.target.value,
                    }))
                  }
                  placeholder="CEO, Acme Inc."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-1">
                Acknowledgement (HTML)
              </label>
              <textarea
                rows={4}
                value={form.acknowledgement_html}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    acknowledgement_html: e.target.value,
                  }))
                }
                placeholder="<p>Thanks to the team at … for…</p>"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary font-mono focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {editingId ? "Update" : "Create"}
            </Button>
            <Button variant="ghost" onClick={() => setViewMode("list")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-primary">
          Projects ({projects.length})
        </h2>
        <Button size="sm" onClick={openCreate}>
          <Plus size={16} /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-center py-12 text-muted">
          No projects yet. Add your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
            >
              {p.image_url && (
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded border border-border">
                  <Image
                    src={p.image_url}
                    alt={p.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-primary truncate">
                    {p.title}
                  </h3>
                  {p.featured && (
                    <Star size={14} className="text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted truncate">
                  {p.tech_stack.join(", ")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    p.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}
                >
                  {p.status === "published" ? (
                    <Eye size={12} className="inline mr-1" />
                  ) : (
                    <EyeOff size={12} className="inline mr-1" />
                  )}
                  {p.status}
                </span>
                <button
                  onClick={() => openEdit(p)}
                  className="p-1.5 text-muted hover:text-primary rounded-md hover:bg-secondary"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-muted hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
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
