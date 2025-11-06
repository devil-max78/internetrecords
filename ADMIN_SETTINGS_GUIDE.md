# Admin Settings Guide

## Overview

The Admin Settings page allows administrators to manage global dropdown options that are used throughout the application. This includes:

- **Sub-Labels**: Record labels under the main label
- **Publishers**: Music publishers
- **Album Categories**: Types of albums (Album, Movie/Soundtrack, Devotional, Classical)
- **Content Types**: Release types (Album, Single, Compilation, Remix, EP)

## Accessing Admin Settings

1. Log in as an admin user
2. Navigate to the Admin Dashboard (`/admin`)
3. Click the "Settings" button in the top right corner
4. You'll be redirected to `/admin/settings`

## Features

### Managing Dropdown Options

Each section (Sub-Labels, Publishers, Album Categories, Content Types) has:

1. **Add New Option**
   - Enter the name in the input field
   - Click "Add" button
   - The new option will appear in the list below
   - Duplicate names are prevented

2. **View Current Options**
   - All existing options are displayed in a list
   - Options are sorted alphabetically

### Sub-Labels Migration

Sub-labels have been updated to be **global** (admin-managed) instead of user-specific.

#### Running the Migration

**Option 1: Using the Script**
```bash
node scripts/migrate-sublabels-global.js
```

**Option 2: Manual SQL (Recommended)**

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop the existing unique constraint
ALTER TABLE sub_labels DROP CONSTRAINT IF EXISTS sub_labels_name_user_id_key;

-- Make user_id nullable (for backward compatibility)
ALTER TABLE sub_labels ALTER COLUMN user_id DROP NOT NULL;

-- Add new unique constraint on name only
ALTER TABLE sub_labels ADD CONSTRAINT sub_labels_name_key UNIQUE (name);
```

**Optional: Remove user_id column entirely**
```sql
ALTER TABLE sub_labels DROP COLUMN IF EXISTS user_id;
```

## API Endpoints

### Admin Endpoints (Require Admin Role)

```
POST /api/admin/sub-labels
POST /api/admin/publishers
POST /api/admin/album-categories
POST /api/admin/content-types
```

Request body:
```json
{
  "name": "Option Name"
}
```

### Public Metadata Endpoints

```
GET /api/metadata/sub-labels
GET /api/metadata/publishers
GET /api/metadata/album-categories
GET /api/metadata/content-types
```

## Usage in Upload Form

When users create a new release, they can select from these admin-managed options:

1. **Sub-Label**: Choose from existing sub-labels or create new (if allowed)
2. **Album Category**: Select from dropdown (Album, Movie/Soundtrack, etc.)
3. **Content Type**: Select from dropdown (Album, Single, Compilation, etc.)
4. **Publisher**: Select from dropdown

## Default Values

The system comes with these default values:

### Publishers
- Internet Records
- Jyoti Digital Media

### Album Categories
- Album
- Movie/Soundtrack
- Devotional
- Classical

### Content Types
- Album
- Single
- Compilation
- Remix
- EP

## Adding New Options

Admins can add new options at any time through the Settings page. These will immediately become available to all users in the upload form.

## Security

- Only users with `ADMIN` role can access the settings page
- Only admins can create new dropdown options
- All users can view the available options
- Row Level Security (RLS) policies enforce these permissions

## Troubleshooting

### "Access Denied" Error
- Ensure you're logged in as an admin user
- Check that your user role is set to `ADMIN` in the database

### "Already Exists" Error
- The option name must be unique
- Check the current list for duplicates
- Names are case-sensitive

### Migration Issues
- If the script fails, run the SQL manually in Supabase
- Check that you have the correct service role key
- Verify your Supabase connection

## Future Enhancements

Potential improvements:
- Edit existing options
- Delete unused options
- Reorder options
- Set default options
- Bulk import/export
- Usage statistics
