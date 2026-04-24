-- Move from one-testimonial-per-project (inline columns on `projects`) to a
-- separate `project_testimonials` table so a single project can have multiple
-- client reviews (e.g. one SaaS product sold to 4 different shops).
--
-- This migration is idempotent-ish: the CREATE / INSERT guards are explicit,
-- but the DROP COLUMN statements use IF EXISTS so a re-run is safe.
--
-- Run once in the Supabase SQL editor.

-- 1. New table
create table if not exists project_testimonials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  client_name text not null,
  client_logo_url text,
  quote text not null,
  author text,
  author_role text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists project_testimonials_project_idx
  on project_testimonials(project_id, sort_order);

alter table project_testimonials enable row level security;

-- Public READ policy (testimonials are part of the public portfolio). Writes
-- go through the admin CRUD route using the service-role key, which bypasses
-- RLS — no INSERT/UPDATE/DELETE policy needed.
drop policy if exists "Public can read project testimonials"
  on project_testimonials;
create policy "Public can read project testimonials"
  on project_testimonials for select using (true);

-- 2. One-time data migration: copy the inline testimonial into row 1 of the
-- new table for every project that has one. Guarded so a re-run doesn't
-- duplicate.
insert into project_testimonials
  (project_id, client_name, client_logo_url, quote, author, author_role, sort_order)
select
  p.id,
  coalesce(p.client_name, 'Client'),
  p.client_logo_url,
  p.testimonial_quote,
  p.testimonial_author,
  p.testimonial_author_role,
  0
from projects p
where p.testimonial_quote is not null
  and p.testimonial_quote <> ''
  and not exists (
    select 1 from project_testimonials t where t.project_id = p.id
  );

-- 3. Drop the legacy inline testimonial columns on projects. Acknowledgement
-- stays — different concept (longer-form thank-you block, not a quote).
alter table projects
  drop column if exists client_name,
  drop column if exists client_logo_url,
  drop column if exists testimonial_quote,
  drop column if exists testimonial_author,
  drop column if exists testimonial_author_role;
