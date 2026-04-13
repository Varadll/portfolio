import { supabase } from "./supabase";
import type {
  Project,
  Experience,
  Education,
  Certification,
  Skill,
  ContactMessage,
  SiteSettings,
} from "@/types/portfolio";

// ── Site Settings ────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    name: "Varad Kanade",
    title: "Full Stack Developer",
    tagline: "Building modern web experiences with Next.js, React & Supabase",
    photo_url: null,
  },
  about: {
    bio_html:
      "<p>I'm a passionate Full Stack Developer who loves building performant, user-friendly web applications. With experience in modern frameworks and cloud technologies, I turn ideas into polished digital products.</p>",
    specialties: [
      "Next.js & React",
      "TypeScript",
      "Supabase & PostgreSQL",
      "Tailwind CSS",
      "E-commerce Solutions",
    ],
  },
  social_links: {
    linkedin: null,
    github: null,
    email: null,
    twitter: null,
  },
  resume_url: null,
};

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["hero", "about", "social_links", "resume_url"]);

    if (error || !data || data.length === 0) return DEFAULT_SETTINGS;

    const settings = { ...DEFAULT_SETTINGS };
    for (const row of data) {
      if (row.key === "hero") settings.hero = { ...settings.hero, ...row.value };
      if (row.key === "about")
        settings.about = { ...settings.about, ...row.value };
      if (row.key === "social_links")
        settings.social_links = { ...settings.social_links, ...row.value };
      if (row.key === "resume_url") settings.resume_url = row.value;
    }
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSetting(key: string, value: unknown) {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function fetchProjects(publishedOnly = true): Promise<Project[]> {
  try {
    let query = supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (publishedOnly) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as Project[];
  } catch {
    return [];
  }
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(4);

    if (error) return [];
    return (data ?? []) as Project[];
  } catch {
    return [];
  }
}

export async function fetchProjectBySlug(
  slug: string
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) return null;
    return data as Project;
  } catch {
    return null;
  }
}

export async function createProject(
  project: Omit<Project, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { error } = await supabase
    .from("projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ── Experience ───────────────────────────────────────────────────────────────

export async function fetchExperience(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from("experience")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return (data ?? []) as Experience[];
  } catch {
    return [];
  }
}

export async function createExperience(
  exp: Omit<Experience, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("experience")
    .insert(exp)
    .select()
    .single();
  if (error) throw error;
  return data as Experience;
}

export async function updateExperience(
  id: string,
  updates: Partial<Experience>
) {
  const { error } = await supabase
    .from("experience")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteExperience(id: string) {
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) throw error;
}

// ── Education ────────────────────────────────────────────────────────────────

export async function fetchEducation(): Promise<Education[]> {
  try {
    const { data, error } = await supabase
      .from("education")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return (data ?? []) as Education[];
  } catch {
    return [];
  }
}

export async function createEducation(
  edu: Omit<Education, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("education")
    .insert(edu)
    .select()
    .single();
  if (error) throw error;
  return data as Education;
}

export async function updateEducation(
  id: string,
  updates: Partial<Education>
) {
  const { error } = await supabase
    .from("education")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteEducation(id: string) {
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) throw error;
}

// ── Certifications ───────────────────────────────────────────────────────────

export async function fetchCertifications(): Promise<Certification[]> {
  try {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return (data ?? []) as Certification[];
  } catch {
    return [];
  }
}

export async function createCertification(
  cert: Omit<Certification, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("certifications")
    .insert(cert)
    .select()
    .single();
  if (error) throw error;
  return data as Certification;
}

export async function updateCertification(
  id: string,
  updates: Partial<Certification>
) {
  const { error } = await supabase
    .from("certifications")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCertification(id: string) {
  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Skills ───────────────────────────────────────────────────────────────────

export async function fetchSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return [];
    return (data ?? []) as Skill[];
  } catch {
    return [];
  }
}

export async function createSkill(skill: Omit<Skill, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("skills")
    .insert(skill)
    .select()
    .single();
  if (error) throw error;
  return data as Skill;
}

export async function updateSkill(id: string, updates: Partial<Skill>) {
  const { error } = await supabase.from("skills").update(updates).eq("id", id);
  if (error) throw error;
}

export async function deleteSkill(id: string) {
  const { error } = await supabase.from("skills").delete().eq("id", id);
  if (error) throw error;
}

// ── Contact Messages ─────────────────────────────────────────────────────────

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function submitContactMessage(
  msg: Pick<ContactMessage, "name" | "email" | "subject" | "message">
) {
  const { error } = await supabase.from("contact_messages").insert(msg);
  if (error) throw error;
}

export async function markMessageRead(id: string) {
  const { error } = await supabase
    .from("contact_messages")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteContactMessage(id: string) {
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
