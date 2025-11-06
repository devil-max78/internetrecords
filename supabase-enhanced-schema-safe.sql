-- Enhanced schema for music distribution with all required fields
-- Safe version that handles existing objects

-- Create sub_labels table
CREATE TABLE IF NOT EXISTS sub_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id)
);

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

-- Create artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create publishers table
CREATE TABLE IF NOT EXISTS publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create release_artists junction table
CREATE TABLE IF NOT EXISTS release_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'PRIMARY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(release_id, artist_id, role)
);

-- Add new columns to releases table (safe - only adds if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='sub_label_id') THEN
    ALTER TABLE releases ADD COLUMN sub_label_id UUID REFERENCES sub_labels(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='upc') THEN
    ALTER TABLE releases ADD COLUMN upc VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='original_release_date') THEN
    ALTER TABLE releases ADD COLUMN original_release_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='go_live_date') THEN
    ALTER TABLE releases ADD COLUMN go_live_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='album_category_id') THEN
    ALTER TABLE releases ADD COLUMN album_category_id UUID REFERENCES album_categories(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='content_type_id') THEN
    ALTER TABLE releases ADD COLUMN content_type_id UUID REFERENCES content_types(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='c_line') THEN
    ALTER TABLE releases ADD COLUMN c_line VARCHAR(255) DEFAULT 'Internet Records';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='publisher_id') THEN
    ALTER TABLE releases ADD COLUMN publisher_id UUID REFERENCES publishers(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='primary_artist_id') THEN
    ALTER TABLE releases ADD COLUMN primary_artist_id UUID REFERENCES artists(id);
  END IF;
  
  -- Remove brand_name if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='releases' AND column_name='brand_name') THEN
    ALTER TABLE releases DROP COLUMN brand_name;
  END IF;
END $$;

-- Add CRBT (Caller Ring Back Tone) time to tracks
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='crbt_start_time') THEN
    ALTER TABLE tracks ADD COLUMN crbt_start_time INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tracks' AND column_name='crbt_end_time') THEN
    ALTER TABLE tracks ADD COLUMN crbt_end_time INTEGER;
  END IF;
END $$;

-- Insert default data (safe - uses ON CONFLICT)
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

-- Drop existing triggers if they exist, then create them
DROP TRIGGER IF EXISTS update_sub_labels_updated_at ON sub_labels;
CREATE TRIGGER update_sub_labels_updated_at BEFORE UPDATE ON sub_labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_publishers_updated_at ON publishers;
CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_album_categories_updated_at ON album_categories;
CREATE TRIGGER update_album_categories_updated_at BEFORE UPDATE ON album_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_types_updated_at ON content_types;
CREATE TRIGGER update_content_types_updated_at BEFORE UPDATE ON content_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE sub_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create them
DROP POLICY IF EXISTS "Service role has full access to sub_labels" ON sub_labels;
CREATE POLICY "Service role has full access to sub_labels" ON sub_labels
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to artists" ON artists;
CREATE POLICY "Service role has full access to artists" ON artists
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to publishers" ON publishers;
CREATE POLICY "Service role has full access to publishers" ON publishers
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to release_artists" ON release_artists;
CREATE POLICY "Service role has full access to release_artists" ON release_artists
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to album_categories" ON album_categories;
CREATE POLICY "Service role has full access to album_categories" ON album_categories
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to content_types" ON content_types;
CREATE POLICY "Service role has full access to content_types" ON content_types
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_releases_sub_label_id ON releases(sub_label_id);
CREATE INDEX IF NOT EXISTS idx_releases_album_category_id ON releases(album_category_id);
CREATE INDEX IF NOT EXISTS idx_releases_content_type_id ON releases(content_type_id);
CREATE INDEX IF NOT EXISTS idx_releases_publisher_id ON releases(publisher_id);
CREATE INDEX IF NOT EXISTS idx_releases_primary_artist_id ON releases(primary_artist_id);
CREATE INDEX IF NOT EXISTS idx_release_artists_release_id ON release_artists(release_id);
CREATE INDEX IF NOT EXISTS idx_release_artists_artist_id ON release_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
