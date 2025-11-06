-- Enhanced schema for music distribution with all required fields

-- Create sub_labels table (global, admin-managed)
CREATE TABLE IF NOT EXISTS sub_labels (
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

-- Add new columns to releases table
ALTER TABLE releases ADD COLUMN IF NOT EXISTS sub_label_id UUID REFERENCES sub_labels(id);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS brand_name VARCHAR(255);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS upc VARCHAR(50);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS original_release_date DATE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS go_live_date DATE;
ALTER TABLE releases ADD COLUMN IF NOT EXISTS album_category VARCHAR(50);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS content_type VARCHAR(50);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS c_line VARCHAR(255);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES publishers(id);
ALTER TABLE releases ADD COLUMN IF NOT EXISTS primary_artist_id UUID REFERENCES artists(id);

-- Create release_artists junction table (for multiple artists)
CREATE TABLE IF NOT EXISTS release_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(release_id, artist_id)
);

-- Create YouTube claims table
CREATE TABLE IF NOT EXISTS youtube_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
  video_urls TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create YouTube OAC requests table
CREATE TABLE IF NOT EXISTS youtube_oac_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_link VARCHAR(500) NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_releases_sub_label_id ON releases(sub_label_id);
CREATE INDEX IF NOT EXISTS idx_releases_publisher_id ON releases(publisher_id);
CREATE INDEX IF NOT EXISTS idx_releases_primary_artist_id ON releases(primary_artist_id);
CREATE INDEX IF NOT EXISTS idx_release_artists_release_id ON release_artists(release_id);
CREATE INDEX IF NOT EXISTS idx_release_artists_artist_id ON release_artists(artist_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_user_id ON youtube_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_release_id ON youtube_claims(release_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_status ON youtube_claims(status);
CREATE INDEX IF NOT EXISTS idx_youtube_oac_requests_user_id ON youtube_oac_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_oac_requests_status ON youtube_oac_requests(status);

-- Insert default publishers
INSERT INTO publishers (name) VALUES ('Jyoti Digital Media')
ON CONFLICT (name) DO NOTHING;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sub_labels_updated_at ON sub_labels;
CREATE TRIGGER update_sub_labels_updated_at BEFORE UPDATE ON sub_labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_artists_updated_at ON artists;
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_publishers_updated_at ON publishers;
CREATE TRIGGER update_publishers_updated_at BEFORE UPDATE ON publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_youtube_claims_updated_at ON youtube_claims;
CREATE TRIGGER update_youtube_claims_updated_at BEFORE UPDATE ON youtube_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_youtube_oac_requests_updated_at ON youtube_oac_requests;
CREATE TRIGGER update_youtube_oac_requests_updated_at BEFORE UPDATE ON youtube_oac_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE sub_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_oac_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to sub_labels" ON sub_labels
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to artists" ON artists
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to publishers" ON publishers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to release_artists" ON release_artists
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to youtube_claims" ON youtube_claims
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role has full access to youtube_oac_requests" ON youtube_oac_requests
  FOR ALL USING (true) WITH CHECK (true);
