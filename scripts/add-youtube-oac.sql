-- Migration: Add YouTube OAC Requests Feature
-- Run this in Supabase SQL Editor

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_youtube_oac_requests_user_id ON youtube_oac_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_oac_requests_status ON youtube_oac_requests(status);

-- Enable Row Level Security
ALTER TABLE youtube_oac_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (service role has full access)
CREATE POLICY "Service role has full access to youtube_oac_requests" ON youtube_oac_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic updated_at timestamp
DROP TRIGGER IF EXISTS update_youtube_oac_requests_updated_at ON youtube_oac_requests;
CREATE TRIGGER update_youtube_oac_requests_updated_at BEFORE UPDATE ON youtube_oac_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'youtube_oac_requests'
ORDER BY ordinal_position;
