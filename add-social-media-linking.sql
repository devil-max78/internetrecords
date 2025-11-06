-- Add Social Media Linking Requests table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS social_media_linking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  platforms VARCHAR(50) NOT NULL,
  facebook_page_url VARCHAR(500),
  instagram_handle VARCHAR(255),
  isrc VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_social_media_linking_user_id ON social_media_linking_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_linking_status ON social_media_linking_requests(status);

-- Enable RLS
ALTER TABLE social_media_linking_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Service role has full access to social_media_linking_requests" ON social_media_linking_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_social_media_linking_requests_updated_at ON social_media_linking_requests;
CREATE TRIGGER update_social_media_linking_requests_updated_at BEFORE UPDATE ON social_media_linking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'social_media_linking_requests'
ORDER BY ordinal_position;
