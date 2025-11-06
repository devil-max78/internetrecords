# YouTube Claim Feature - Quick Start Guide

## Setup (One-Time)

### 1. Run Database Migration

Open Supabase SQL Editor and run:

```bash
# Copy the contents of scripts/add-youtube-claims.sql
# Or run this directly:
```

```sql
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

CREATE INDEX idx_youtube_claims_user_id ON youtube_claims(user_id);
CREATE INDEX idx_youtube_claims_release_id ON youtube_claims(release_id);
CREATE INDEX idx_youtube_claims_status ON youtube_claims(status);

ALTER TABLE youtube_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to youtube_claims" ON youtube_claims
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_youtube_claims_updated_at BEFORE UPDATE ON youtube_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Restart Your Server

```bash
npm run dev
```

## Usage

### For Users

1. **Access the Page**
   - Click "YouTube Claim" in the navigation bar
   - Or navigate to: `http://localhost:5173/youtube-claim`

2. **Submit a Claim**
   - (Optional) Select a release from dropdown
   - Enter YouTube URLs in the text area:
     ```
     https://youtube.com/watch?v=abc123,
     https://youtube.com/watch?v=def456
     ```
   - Click "Submit"

3. **View History**
   - Scroll down to see all your submitted claims
   - Check status: Pending, Processing, Completed, or Rejected
   - Read admin notes if any

### For Admins

1. **Access Admin Panel**
   - Go to Admin Dashboard
   - Click "YouTube Claims" button
   - Or navigate to: `http://localhost:5173/admin/youtube-claims`

2. **View Statistics**
   - See counts for each status at the top
   - View all claims in the table below

3. **Manage Claims**
   - Click "Manage" on any claim
   - Update status from dropdown
   - Add notes for the user
   - Click "Update Status"

## Status Workflow

```
User submits → PENDING
              ↓
Admin reviews → PROCESSING
              ↓
Admin decides → COMPLETED or REJECTED
```

## Features

✅ Submit multiple YouTube URLs (comma-separated)
✅ Link claims to releases (optional)
✅ View claim history with status
✅ Admin dashboard with statistics
✅ Status management with notes
✅ Automatic timestamps

## Troubleshooting

**"Table doesn't exist" error:**
- Run the migration SQL in Supabase

**"Access denied" error:**
- Make sure you're logged in
- Check your authentication token

**Can't see YouTube Claims in navbar:**
- Restart the development server
- Clear browser cache

**Admin can't access YouTube Claims:**
- Verify user role is 'ADMIN' in database
- Check authentication

## API Endpoints

**User Endpoints:**
- `POST /api/youtube-claims` - Submit claim
- `GET /api/youtube-claims` - Get your claims

**Admin Endpoints:**
- `GET /api/admin/youtube-claims` - Get all claims
- `PATCH /api/admin/youtube-claims/:id` - Update status

## That's It!

The feature is now ready to use. Users can submit claims and admins can manage them through the web interface.

For more details, see `YOUTUBE_CLAIM_FEATURE.md`
