-- Fix sub_labels table to allow global (admin-managed) sub-labels
-- Run this in Supabase SQL Editor NOW

-- Make user_id nullable
ALTER TABLE sub_labels ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old unique constraint (if it exists)
ALTER TABLE sub_labels DROP CONSTRAINT IF EXISTS sub_labels_name_user_id_key;

-- Add new unique constraint on name only
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sub_labels_name_key'
    ) THEN
        ALTER TABLE sub_labels ADD CONSTRAINT sub_labels_name_key UNIQUE (name);
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'sub_labels' 
ORDER BY ordinal_position;
