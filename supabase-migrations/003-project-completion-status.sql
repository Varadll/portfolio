-- Add completion_status to projects so cards can show "Completed" vs "In Development".
-- Separate from the existing `status` column (draft/published) which gates visibility.
-- Run once in the Supabase SQL editor. Defaults to 'completed' so legacy rows
-- render as completed until you flip them.

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS completion_status TEXT
    DEFAULT 'completed'
    CHECK (completion_status IN ('completed', 'in_progress'));

-- Optional cleanup: the Skills feature has been removed from the app.
-- Drop the orphan table only if you're sure nothing else reads from it.
-- DROP TABLE IF EXISTS skills CASCADE;
