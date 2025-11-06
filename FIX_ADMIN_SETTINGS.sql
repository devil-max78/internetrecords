-- Simple fix for admin settings - Run this in Supabase SQL Editor

-- Just verify the tables exist and insert default data
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

INSERT INTO publishers (name) VALUES 
  ('Internet Records'),
  ('Jyoti Digital Media')
ON CONFLICT (name) DO NOTHING;

-- Verify everything is working
SELECT 'Album Categories:' as table_name, COUNT(*) as count FROM album_categories
UNION ALL
SELECT 'Content Types:', COUNT(*) FROM content_types
UNION ALL
SELECT 'Publishers:', COUNT(*) FROM publishers
UNION ALL
SELECT 'Sub Labels:', COUNT(*) FROM sub_labels;
