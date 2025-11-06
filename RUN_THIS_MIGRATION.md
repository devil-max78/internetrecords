# IMPORTANT: Run This Migration in Supabase

## The admin settings features (add/delete) are failing because these tables need to be created in your Supabase database.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run This SQL

Copy and paste this entire SQL script:

```sql
-- Create admin-managed dropdown options tables
CREATE TABLE IF NOT EXISTS album_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update sub_labels table to be global (remove user_id requirement)
ALTER TABLE sub_labels DROP CONSTRAINT IF EXISTS sub_labels_name_user_id_key;
ALTER TABLE sub_labels ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE sub_labels ADD CONSTRAINT sub_labels_name_key UNIQUE (name);

-- Insert default data
INSERT INTO publishers (name) VALUES 
  ('Internet Records'),
  ('Jyoti Digital Media')
ON CONFLICT (name) DO NOTHING;

INSERT INTO album_categories (name) VALUES 
  ('Album'),
  ('Movie/Soundtrack'),
  ('Devotional'),
  ('Classical')
ON CONFLICT (name) DO NOTHING;

INSERT INTO content_types (name) VALUES 
  ('Album'),
  ('Single'),
  ('Compilation'),
  ('Remix'),
  ('EP')
ON CONFLICT (name) DO NOTHING;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_album_categories_updated_at ON album_categories;
CREATE TRIGGER update_album_categories_updated_at BEFORE UPDATE ON album_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_types_updated_at ON content_types;
CREATE TRIGGER update_content_types_updated_at BEFORE UPDATE ON content_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE album_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to album_categories" ON album_categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to content_types" ON content_types
  FOR ALL USING (true) WITH CHECK (true);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('album_categories', 'content_types', 'sub_labels', 'publishers')
ORDER BY table_name;
```

### Step 3: Click "Run" or press Ctrl+Enter

You should see a success message and a list of tables at the end.

### Step 4: Refresh Your Browser

After running the migration, refresh your browser at `http://localhost:5173/admin/settings`

Now you should be able to:
- ✅ Add new sub-labels, publishers, album categories, and content types
- ✅ Delete existing items
- ✅ Manage user roles

## Troubleshooting

If you still get errors:

1. **Check if tables exist:**
   ```sql
   SELECT * FROM album_categories;
   SELECT * FROM content_types;
   SELECT * FROM publishers;
   SELECT * FROM sub_labels;
   ```

2. **Check RLS policies:**
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('album_categories', 'content_types', 'publishers', 'sub_labels');
   ```

3. **Restart the server:**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

## What This Migration Does

1. Creates `album_categories` table
2. Creates `content_types` table
3. Makes `sub_labels` global (removes user_id requirement)
4. Inserts default data for all tables
5. Sets up triggers for automatic timestamp updates
6. Enables Row Level Security (RLS)
7. Creates policies for service role access

After this migration, all admin settings features will work perfectly! 🎉
