-- Allow authenticated users to upload into the portfolio-images bucket.
-- Only the portfolio owner can sign in (auth is email/password, email-gated
-- client-side), so in practice this grants the admin alone write access.
--
-- Without this policy, `supabase.storage.from('portfolio-images').upload()`
-- from the browser returns "new row violates row-level security policy".
--
-- Run once in the Supabase SQL editor.

CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-images');

-- Optional: allow overwriting existing objects (same-name re-uploads).
CREATE POLICY "Authenticated users can update portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-images')
WITH CHECK (bucket_id = 'portfolio-images');
