# 🚨 URGENT: Run Database Migration

## The application is failing because new database tables don't exist yet.

### Quick Fix (5 minutes):

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/spxvjfkojezlcowhwjzv/sql
   - Or navigate to your project → SQL Editor

2. **Copy the SQL**
   - Open the file: `supabase-enhanced-schema.sql`
   - Select all content (Ctrl+A)
   - Copy (Ctrl+C)

3. **Run the SQL**
   - Paste into the SQL Editor
   - Click "Run" button
   - Wait for completion (should take a few seconds)

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check that these tables exist:
     - `album_categories`
     - `content_types`
     - `publishers` (should have data)

5. **Restart the Application**
   - The server should auto-restart
   - Refresh your browser
   - The errors should be gone!

### What This Migration Does:

✅ Creates `album_categories` table with default categories
✅ Creates `content_types` table with default types  
✅ Adds `album_category_id` and `content_type_id` to releases
✅ Adds `crbt_start_time` and `crbt_end_time` to tracks
✅ Removes `brand_name` column
✅ Sets default C-Line to "Internet Records"
✅ Inserts default publishers and categories

### If You Get Errors:

Some errors are OK if tables already exist. Look for:
- "already exists" - This is fine, skip it
- "does not exist" - This needs attention

Common issues:
- **Column already exists**: Safe to ignore
- **Table already exists**: Safe to ignore  
- **Foreign key constraint**: Make sure parent tables exist first

### Alternative: Run Statements One by One

If the full SQL fails, run these sections separately:

1. First: Create new tables
2. Second: Alter existing tables
3. Third: Insert default data
4. Fourth: Create triggers
5. Fifth: Set up RLS policies

### Need Help?

Check the server logs for specific error messages:
```
npm run dev:server
```

Look for database connection errors or missing table errors.
