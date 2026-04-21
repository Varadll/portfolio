import { supabase } from "./supabase";
import { adminDb } from "./admin-client";
import type {
  Project,
  Experience,
  Education,
  Certification,
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
  home_sections: {
    show_certifications: true,
  },
  projects_section: {
    heading: "Featured Projects",
    subtitle: "A selection of projects I've successfully delivered to clients.",
  },
};

export async function fetchSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "hero",
        "about",
        "social_links",
        "resume_url",
        "home_sections",
        "projects_section",
      ]);

    if (error || !data || data.length === 0) return DEFAULT_SETTINGS;

    const settings = { ...DEFAULT_SETTINGS };
    for (const row of data) {
      if (row.key === "hero") settings.hero = { ...settings.hero, ...row.value };
      if (row.key === "about")
        settings.about = { ...settings.about, ...row.value };
      if (row.key === "social_links")
        settings.social_links = { ...settings.social_links, ...row.value };
      if (row.key === "resume_url") settings.resume_url = row.value;
      if (row.key === "home_sections")
        settings.home_sections = {
          ...settings.home_sections,
          ...row.value,
        };
      if (row.key === "projects_section")
        settings.projects_section = {
          ...settings.projects_section,
          ...row.value,
        };
    }
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSetting(key: string, value: unknown) {
  await adminDb.upsert("site_settings", { key, value, updated_at: new Date().toISOString() }, "key");
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
  return await adminDb.insert("projects", project) as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  await adminDb.update("projects", id, { ...updates, updated_at: new Date().toISOString() });
}

export async function deleteProject(id: string) {
  await adminDb.remove("projects", id);
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
  return await adminDb.insert("experience", exp) as Experience;
}

export async function updateExperience(
  id: string,
  updates: Partial<Experience>
) {
  await adminDb.update("experience", id, updates);
}

export async function deleteExperience(id: string) {
  await adminDb.remove("experience", id);
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
  return await adminDb.insert("education", edu) as Education;
}

export async function updateEducation(
  id: string,
  updates: Partial<Education>
) {
  await adminDb.update("education", id, updates);
}

export async function deleteEducation(id: string) {
  await adminDb.remove("education", id);
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
  return await adminDb.insert("certifications", cert) as Certification;
}

export async function updateCertification(
  id: string,
  updates: Partial<Certification>
) {
  await adminDb.update("certifications", id, updates);
}

export async function deleteCertification(id: string) {
  await adminDb.remove("certifications", id);
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
  await adminDb.update("contact_messages", id, { read: true });
}

export async function deleteContactMessage(id: string) {
  await adminDb.remove("contact_messages", id);
}
