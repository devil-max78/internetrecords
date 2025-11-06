# Migration Guide for Enhanced Features

## Overview
This guide will help you migrate your existing database to support the new enhanced features.

## Prerequisites
- Supabase project set up
- Database credentials in `.env` file
- Node.js and npm installed

## Step 1: Backup Your Database
Before making any changes, backup your existing data:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or using pg_dump
pg_dump -h <your-host> -U postgres -d postgres > backup.sql
```

## Step 2: Run the Enhanced Schema

### Option A: Using the Setup Script (Recommended)
```bash
npm run setup:supabase
```

This will:
- Create new tables (`album_categories`, `content_types`)
- Add new columns to existing tables
- Insert default data
- Set up RLS policies
- Create triggers

### Option B: Manual SQL Execution
```bash
# Connect to your Supabase database
psql -h <your-supabase-host> -U postgres -d postgres -f supabase-enhanced-schema.sql
```

## Step 3: Verify the Migration

### Check New Tables
```sql
-- Verify album_categories table
SELECT * FROM album_categories;

-- Verify content_types table
SELECT * FROM content_types;

-- Verify publishers table
SELECT * FROM publishers;
```

### Check Updated Columns
```sql
-- Check releases table structure
\d releases

-- Should show:
-- - album_category_id (UUID)
-- - content_type_id (UUID)
-- - c_line (VARCHAR with default 'Internet Records')
-- - No brand_name column

-- Check tracks table structure
\d tracks

-- Should show:
-- - crbt_start_time (INTEGER)
-- - crbt_end_time (INTEGER)
```

## Step 4: Update Existing Data (If Needed)

### Set C-Line for Existing Releases
```sql
UPDATE releases 
SET c_line = 'Internet Records' 
WHERE c_line IS NULL;
```

### Migrate Old Category Data (If Applicable)
If you had album_category as a text field:
```sql
-- First, create categories from existing data
INSERT INTO album_categories (name)
SELECT DISTINCT album_category 
FROM releases 
WHERE album_category IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Then, update releases to use the new foreign key
UPDATE releases r
SET album_category_id = ac.id
FROM album_categories ac
WHERE r.album_category = ac.name;
```

### Migrate Old Content Type Data (If Applicable)
```sql
-- First, create content types from existing data
INSERT INTO content_types (name)
SELECT DISTINCT content_type 
FROM releases 
WHERE content_type IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- Then, update releases to use the new foreign key
UPDATE releases r
SET content_type_id = ct.id
FROM content_types ct
WHERE r.content_type = ct.name;
```

## Step 5: Test the Application

### Test Admin Functions
1. Log in as admin
2. Try adding a new publisher
3. Try adding a new album category
4. Try adding a new content type

### Test User Functions
1. Log in as regular user
2. Create a new release
3. Verify dropdowns show admin-added options
4. Test artist search and selection
5. Add tracks with audio files
6. Set CRBT times

### Test API Endpoints
```bash
# Get album categories
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/metadata/album-categories

# Get content types
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/metadata/content-types

# Get publishers
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/metadata/publishers

# Create publisher (admin only)
curl -X POST -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Publisher"}' \
  http://localhost:5000/api/admin/publishers
```

## Step 6: Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
# Restore from backup
psql -h <your-host> -U postgres -d postgres < backup.sql
```

## Common Issues & Solutions

### Issue: Foreign Key Constraint Errors
**Solution**: Make sure all referenced tables exist before creating foreign keys.

### Issue: RLS Policy Errors
**Solution**: Ensure you're using the service role key for admin operations.

### Issue: Duplicate Key Errors
**Solution**: The schema uses `ON CONFLICT DO NOTHING` for default data, so this shouldn't happen. If it does, check for existing data.

### Issue: Column Already Exists
**Solution**: The schema uses `ADD COLUMN IF NOT EXISTS`, so this shouldn't happen. If it does, the column might already be there from a previous migration.

## Verification Checklist

- [ ] New tables created successfully
- [ ] New columns added to existing tables
- [ ] Default data inserted
- [ ] RLS policies active
- [ ] Triggers working
- [ ] Admin can add dropdown options
- [ ] Users can see dropdown options
- [ ] Artist search works
- [ ] Audio upload works
- [ ] CRBT fields save correctly
- [ ] C-Line defaults to "Internet Records"

## Post-Migration Tasks

1. **Update Documentation**: Inform your team about the new features
2. **Train Admins**: Show admins how to manage dropdown options
3. **Monitor Logs**: Watch for any errors in the first few days
4. **Gather Feedback**: Ask users about the new artist search feature

## Support

If you encounter issues:
1. Check the application logs
2. Check Supabase logs in the dashboard
3. Verify your `.env` configuration
4. Review the `ENHANCED_FEATURES_SUMMARY.md` for feature details
