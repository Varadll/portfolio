"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Save, Loader2, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { fetchSettings, updateSetting } from "@/lib/supabase-portfolio";
import { uploadAdmin } from "@/lib/admin-client";
import type { SiteSettings } from "@/types/portfolio";

interface Props {
  onMutate: () => Promise<void>;
}

export default function SettingsManager({ onMutate }: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await fetchSettings());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSetting("hero", settings.hero);
      await updateSetting("about", settings.about);
      await updateSetting("social_links", settings.social_links);
      if (settings.resume_url) {
        await updateSetting("resume_url", settings.resume_url);
      }
      await updateSetting("home_sections", settings.home_sections);
      await updateSetting("projects_section", settings.projects_section);
      await onMutate();
      setMessage("Settings saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    try {
      const publicUrl = await uploadAdmin(file, "profile");
      setSettings({
        ...settings,
        hero: { ...settings.hero, photo_url: publicUrl },
      });
    } catch (err) {
      console.error("[SettingsManager] photo upload failed", err);
      alert(
        "Upload failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleResumeUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    try {
      const publicUrl = await uploadAdmin(file, "resume");
      setSettings({ ...settings, resume_url: publicUrl });
    } catch (err) {
      console.error("[SettingsManager] resume upload failed", err);
      alert(
        "Upload failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-lg font-semibold text-primary">Site Settings</h2>

      {/* Hero section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Hero Section
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Name
            </label>
            <input
              value={settings.hero.name}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, name: e.target.value },
                })
              }
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">
              Title
            </label>
            <input
              value={settings.hero.title}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  hero: { ...settings.hero, title: e.target.value },
                })
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
            value={settings.hero.tagline}
            onChange={(e) =>
              setSettings({
                ...settings,
                hero: { ...settings.hero, tagline: e.target.value },
              })
            }
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Profile Photo
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-secondary file:text-primary hover:file:bg-border"
            />
            {settings.hero.photo_url && (
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border">
                <Image
                  src={settings.hero.photo_url}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
          About
        </h3>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Bio (HTML)
          </label>
          <textarea
            rows={5}
            value={settings.about.bio_html}
            onChange={(e) =>
              setSettings({
                ...settings,
                about: { ...settings.about, bio_html: e.target.value },
              })
            }
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary font-mono focus:border-accent focus:ring-1 focus:ring-accent resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Specialties (one per line)
          </label>
          <textarea
            rows={4}
            value={settings.about.specialties.join("\n")}
            onChange={(e) =>
              setSettings({
                ...settings,
                about: {
                  ...settings.about,
                  specialties: e.target.value.split("\n").filter(Boolean),
                },
              })
            }
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent resize-none"
          />
        </div>
      </div>

      {/* Social links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Social Links
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            Object.keys(settings.social_links) as Array<
              keyof typeof settings.social_links
            >
          ).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-primary mb-1 capitalize">
                {key}
              </label>
              <input
                value={settings.social_links[key] || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_links: {
                      ...settings.social_links,
                      [key]: e.target.value || null,
                    },
                  })
                }
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Resume */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Resume
        </h3>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors">
              <Upload size={16} /> Upload PDF
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="hidden"
            />
          </label>
          {settings.resume_url && (
            <a
              href={settings.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              View current resume
            </a>
          )}
        </div>
      </div>

      {/* Home Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Home Sections
        </h3>
        <p className="text-xs text-muted">
          Toggle which sections appear on the home page.
        </p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.home_sections.show_certifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  home_sections: {
                    ...settings.home_sections,
                    show_certifications: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-primary">
              Show Certifications on home
            </span>
          </label>
        </div>
      </div>

      {/* Projects Section copy */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">
          Projects Section
        </h3>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Heading
          </label>
          <input
            value={settings.projects_section.heading}
            onChange={(e) =>
              setSettings({
                ...settings,
                projects_section: {
                  ...settings.projects_section,
                  heading: e.target.value,
                },
              })
            }
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Subtitle
          </label>
          <input
            value={settings.projects_section.subtitle}
            onChange={(e) =>
              setSettings({
                ...settings,
                projects_section: {
                  ...settings.projects_section,
                  subtitle: e.target.value,
                },
              })
            }
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4 pt-4">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save All Settings
        </Button>
        {message && (
          <span className="text-sm text-green-600 dark:text-green-400">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
