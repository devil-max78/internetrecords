-- Make sub-labels global (remove user_id requirement)

-- First, drop the existing unique constraint
ALTER TABLE sub_labels DROP CONSTRAINT IF EXISTS sub_labels_name_user_id_key;

-- Remove the user_id column since sub-labels should be global
ALTER TABLE sub_labels DROP COLUMN IF EXISTS user_id;

-- Add a unique constraint on name only (global uniqueness)
ALTER TABLE sub_labels ADD CONSTRAINT sub_labels_name_key UNIQUE (name);

-- Insert some default sub-labels
INSERT INTO sub_labels (name) VALUES 
  ('Internet Records'),
  ('Jyoti Digital Media'),
  ('Independent')
ON CONFLICT (name) DO NOTHING;
