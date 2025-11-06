-- Add lyricist, composer, and producer fields to tracks table
-- Run this in Supabase SQL Editor

ALTER TABLE tracks ADD COLUMN IF NOT EXISTS lyricist VARCHAR(255);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS composer VARCHAR(255);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS producer VARCHAR(255);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS featuring VARCHAR(255);
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS singer VARCHAR(255);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tracks'
AND column_name IN ('lyricist', 'composer', 'producer', 'featuring', 'singer')
ORDER BY column_name;
