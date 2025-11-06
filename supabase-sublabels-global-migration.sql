-- Migration to make sub_labels global (admin-managed)
-- This removes the user_id requirement and makes sub-labels available to all users

-- Drop the existing unique constraint
ALTER TABLE sub_labels DROP CONSTRAINT IF EXISTS sub_labels_name_user_id_key;

-- Make user_id nullable (for backward compatibility)
ALTER TABLE sub_labels ALTER COLUMN user_id DROP NOT NULL;

-- Add new unique constraint on name only
ALTER TABLE sub_labels ADD CONSTRAINT sub_labels_name_key UNIQUE (name);

-- Optional: Remove user_id column entirely (uncomment if you want to fully remove it)
-- ALTER TABLE sub_labels DROP COLUMN IF EXISTS user_id;
