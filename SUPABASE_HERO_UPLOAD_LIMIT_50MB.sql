-- SADEE PRO STORE: set hero media bucket to Supabase Free plan maximum (50 MiB).
-- Supabase Dashboard > Storage > Settings must also have Global file size limit set to 50 MB.
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']
WHERE id = 'hero-media';

-- If the query updates 0 rows, create a PUBLIC bucket named hero-media in Storage first,
-- then run this query again.
