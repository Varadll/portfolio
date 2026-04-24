export interface Project {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description_html: string;
  tech_stack: string[];
  image_url: string | null;
  gallery_urls: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  sort_order: number;
  status: "draft" | "published";
  completion_status: "completed" | "in_progress";
  acknowledgement_html: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectTestimonial {
  id: string;
  project_id: string;
  client_name: string;
  client_logo_url: string | null;
  quote: string;
  author: string | null;
  author_role: string | null;
  sort_order: number;
  created_at: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  description_html: string | null;
  tech_used: string[];
  type: "fulltime" | "freelance" | "internship" | "contract";
  sort_order: number;
  created_at: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_year: number;
  end_year: number | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string | null;
  credential_url: string | null;
  badge_image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export interface SiteSettings {
  hero: {
    name: string;
    title: string;
    tagline: string;
    photo_url: string | null;
  };
  about: {
    bio_html: string;
    specialties: string[];
  };
  social_links: {
    linkedin: string | null;
    github: string | null;
    email: string | null;
    twitter: string | null;
  };
  resume_url: string | null;
  home_sections: {
    show_certifications: boolean;
  };
  projects_section: {
    heading: string;
    subtitle: string;
  };
}
