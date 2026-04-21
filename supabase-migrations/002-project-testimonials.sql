-- Add client + testimonial + acknowledgement fields to projects.
-- Run this once in the Supabase SQL editor. All columns are optional (nullable);
-- existing rows are unaffected and the public site / admin UI continue to work
-- without them filled in.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_quote TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_author TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_author_role TEXT,
  ADD COLUMN IF NOT EXISTS acknowledgement_html TEXT;
