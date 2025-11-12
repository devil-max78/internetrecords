-- Artist Profile Linking Requests Table

CREATE TABLE IF NOT EXISTS artist_profile_linking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  
  -- Platform URLs/Handles
  instagram_url VARCHAR(500),
  youtube_url VARCHAR(500),
  facebook_url VARCHAR(500),
  spotify_url VARCHAR(500),
  apple_music_url VARCHAR(500),
  
  -- Additional Info
  isrc_code VARCHAR(50),
  additional_notes TEXT,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED')),
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artist_profile_linking_user_id ON artist_profile_linking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_profile_linking_status ON artist_profile_linking_requests(status);
CREATE INDEX IF NOT EXISTS idx_artist_profile_linking_created_at ON artist_profile_linking_requests(created_at DESC);

-- Enable RLS
ALTER TABLE artist_profile_linking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile linking requests" ON artist_profile_linking_requests
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own profile linking requests" ON artist_profile_linking_requests
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Service role has full access to profile linking requests" ON artist_profile_linking_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_artist_profile_linking_updated_at ON artist_profile_linking_requests;
CREATE TRIGGER update_artist_profile_linking_updated_at 
  BEFORE UPDATE ON artist_profile_linking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'artist_profile_linking_requests'
ORDER BY ordinal_position;
