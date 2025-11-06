-- Label and Publisher System Refactor
-- Implements global defaults with user-specific overrides

-- Create global_settings table for default publisher and label
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default global publisher and label
INSERT INTO global_settings (setting_key, setting_value) VALUES 
  ('default_publisher', 'Internet Records'),
  ('default_label', 'Internet Records')
ON CONFLICT (setting_key) DO NOTHING;

-- Create user_labels table (user-specific labels)
CREATE TABLE IF NOT EXISTS user_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, label_name)
);

-- Create user_publishers table (user-specific publishers)
CREATE TABLE IF NOT EXISTS user_publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  publisher_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, publisher_name)
);

-- Add user-specific label and publisher to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_label VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_publisher VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_labels_user_id ON user_labels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_publishers_user_id ON user_publishers(user_id);

-- Enable RLS
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_publishers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read global_settings" ON global_settings
  FOR SELECT USING (true);

CREATE POLICY "Service role has full access to global_settings" ON global_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their own labels" ON user_labels
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role has full access to user_labels" ON user_labels
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Users can read their own publishers" ON user_publishers
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role has full access to user_publishers" ON user_publishers
  FOR ALL USING (true) WITH CHECK (true);

-- Create triggers
DROP TRIGGER IF EXISTS update_global_settings_updated_at ON global_settings;
CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON global_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_labels_updated_at ON user_labels;
CREATE TRIGGER update_user_labels_updated_at BEFORE UPDATE ON user_labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_publishers_updated_at ON user_publishers;
CREATE TRIGGER update_user_publishers_updated_at BEFORE UPDATE ON user_publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('global_settings', 'user_labels', 'user_publishers')
ORDER BY table_name;
