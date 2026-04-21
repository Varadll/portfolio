-- ============================================
-- Portfolio Website - Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  tagline text not null default '',
  description_html text not null default '',
  tech_stack text[] default '{}',
  image_url text,
  gallery_urls text[] default '{}',
  live_url text,
  github_url text,
  featured boolean default false,
  sort_order integer default 0,
  status text default 'draft' check (status in ('draft', 'published')),
  completion_status text default 'completed' check (completion_status in ('completed', 'in_progress')),
  client_name text,
  client_logo_url text,
  testimonial_quote text,
  testimonial_author text,
  testimonial_author_role text,
  acknowledgement_html text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Experience
create table experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  location text,
  start_date date not null,
  end_date date,
  description_html text,
  tech_used text[] default '{}',
  type text default 'fulltime' check (type in ('fulltime', 'freelance', 'internship', 'contract')),
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 3. Education
create table education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  start_year integer not null,
  end_year integer,
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 4. Certifications
create table certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  issue_date date,
  credential_url text,
  badge_image_url text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 5. Contact Messages
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- 6. Site Settings (key-value store for hero, about, social links, etc.)
create table site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- Public can READ published content
-- Only service_role (your admin panel) can write
-- ============================================

-- Enable RLS on all tables
alter table projects enable row level security;
alter table experience enable row level security;
alter table education enable row level security;
alter table certifications enable row level security;
alter table contact_messages enable row level security;
alter table site_settings enable row level security;

-- Public READ policies (visitors can see published content)
create policy "Public can read published projects"
  on projects for select using (status = 'published');

create policy "Public can read experience"
  on experience for select using (true);

create policy "Public can read education"
  on education for select using (true);

create policy "Public can read certifications"
  on certifications for select using (true);

create policy "Public can read site settings"
  on site_settings for select using (true);

-- Contact messages: anyone can INSERT (submit form), no public reads
create policy "Anyone can submit contact message"
  on contact_messages for insert with check (true);

-- No public UPDATE/DELETE policies — all writes go through
-- your admin panel using the service_role key (bypasses RLS)

-- ============================================
-- Insert default site settings
-- ============================================
insert into site_settings (key, value) values
  ('hero', '{"name": "Varad", "title": "Full-Stack Developer", "tagline": "Building modern web experiences", "photo_url": null}'::jsonb),
  ('about', '{"bio_html": "<p>Write your bio here...</p>", "specialties": ["Next.js", "React", "Supabase", "Tailwind CSS"]}'::jsonb),
  ('social_links', '{"linkedin": null, "github": null, "email": null, "twitter": null}'::jsonb),
  ('resume_url', '"null"'::jsonb);

-- ============================================
-- Storage bucket for portfolio images
-- ============================================
insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict do nothing;

-- Allow public reads on portfolio images
create policy "Public can read portfolio images"
  on storage.objects for select
  using (bucket_id = 'portfolio-images');

-- Allow service_role uploads (handled by admin API routes)
-- No policy needed — service_role bypasses RLS
