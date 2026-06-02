-- Add media credits and video support for polls, articles, and policy translations.
-- Run in Supabase SQL Editor before deploying the matching application code.

ALTER TABLE polls ADD COLUMN IF NOT EXISTS image_source TEXT;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS video_source TEXT;

ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_source TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS video_source TEXT;

ALTER TABLE policy_translations ADD COLUMN IF NOT EXISTS image_source TEXT;
ALTER TABLE policy_translations ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE policy_translations ADD COLUMN IF NOT EXISTS video_source TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('media-files', 'media-files', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
