# Supabase Setup Instructions

## Step 1: Add Service Role Key

1. Open your `.env` file
2. Find the line: `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`
3. Replace `your_service_role_key_here` with your actual Supabase service role key
4. You can find your service role key at: https://supabase.com/dashboard/project/spxvjfkojezlcowhwjzv/settings/api

## Step 2: Run Database Migration

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard/project/spxvjfkojezlcowhwjzv/editor
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-migration.sql` file
5. Paste it into the SQL editor
6. Click "Run" or press Ctrl+Enter

### Option B: Using the Migration Script (Alternative)

```bash
npm run migrate:supabase
```

Note: This requires the `exec_sql` function to be available in your Supabase project.

## Step 3: Restart the Server

After the migration is complete, restart your development server:

```bash
npm run dev:server
```

## Step 4: Verify Setup

You should see these messages in the console:
- ✓ Initial admin user created successfully
- ✓ Server running on http://localhost:3000

## What the Migration Creates

The migration sets up:
- **Tables**: users, releases, tracks, file_uploads
- **Enums**: user_role, release_status, file_type
- **Indexes**: For better query performance
- **Triggers**: Auto-update timestamps
- **RLS Policies**: Row Level Security (bypassed by service role key)

## Troubleshooting

### Error: "Could not find the table 'public.users'"
- Make sure you ran the migration SQL in Supabase
- Check that the tables were created in the "Table Editor"

### Error: "Invalid API key"
- Verify your service role key is correct in `.env`
- Make sure there are no extra spaces or quotes

### Error: "relation already exists"
- This is normal if you run the migration multiple times
- The migration is idempotent and safe to re-run

## Security Notes

- The service role key bypasses Row Level Security (RLS)
- Keep your service role key secret and never commit it to version control
- In production, use environment variables or secret management services
- The `.env` file is already in `.gitignore`
