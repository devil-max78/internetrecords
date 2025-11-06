-- Fix admin user ID to match Supabase Auth
-- Run this in Supabase SQL Editor

-- First, delete the old admin user
DELETE FROM users WHERE email = 'admin@example.com';

-- Then insert with the correct ID from Supabase Auth
-- Replace 'YOUR_SUPABASE_AUTH_ID' with the actual ID from the script output
INSERT INTO users (id, email, name, password, role, created_at, updated_at)
VALUES (
  '933f5670-5a41-4dd8-bc17-366d78e2f832',
  'admin@example.com',
  'Admin User',
  '',
  'ADMIN',
  NOW(),
  NOW()
);
