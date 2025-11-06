-- Migration: Add YouTube Claims Feature
-- Run this in Supabase SQL Editor

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_youtube_claims_user_id ON youtube_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_release_id ON youtube_claims(release_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_status ON youtube_claims(status);

-- Enable Row Level Security
ALTER TABLE youtube_claims ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (service role has full access)
CREATE POLICY "Service role has full access to youtube_claims" ON youtube_claims
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_youtube_claims_updated_at ON youtube_claims;
CREATE TRIGGER update_youtube_claims_updated_at BEFORE UPDATE ON youtube_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'youtube_claims'
ORDER BY ordinal_position;
