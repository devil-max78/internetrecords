# YouTube Claim Release Feature

## Overview

The YouTube Claim Release feature allows users to submit YouTube video URLs for content claiming. Admins can then manage these claims, update their status, and add notes.

## Features

### For Users

1. **Submit YouTube Claims**
   - Navigate to `/youtube-claim` from the main navigation
   - Optionally link the claim to an existing release
   - Enter one or more YouTube video URLs (comma-separated)
   - Submit the claim for admin review

2. **View Claim History**
   - See all submitted claims in a table
   - View claim status (Pending, Processing, Completed, Rejected)
   - See submission dates and any admin notes

### For Admins

1. **Manage All Claims**
   - Navigate to `/admin/youtube-claims` from the admin dashboard
   - View summary statistics (Pending, Processing, Completed, Rejected counts)
   - See all claims from all users

2. **Update Claim Status**
   - Click "Manage" on any claim
   - Update status: Pending → Processing → Completed/Rejected
   - Add notes for the user
   - Automatically records processing timestamp

## Database Schema

### youtube_claims Table

```sql
CREATE TABLE youtube_claims (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  release_id UUID REFERENCES releases(id),
  video_urls TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  submitted_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Status Values

- `PENDING` - Newly submitted, awaiting admin review
- `PROCESSING` - Admin is working on the claim
- `COMPLETED` - Claim successfully processed
- `REJECTED` - Claim rejected by admin

## API Endpoints

### User Endpoints

```
POST /api/youtube-claims
- Submit a new YouTube claim
- Body: { releaseId?: string, videoUrls: string }
- Returns: Created claim object

GET /api/youtube-claims
- Get all claims for the authenticated user
- Returns: Array of claim objects

GET /api/youtube-claims/:id
- Get a specific claim by ID
- Returns: Claim object
```

### Admin Endpoints

```
GET /api/admin/youtube-claims
- Get all claims from all users
- Requires: Admin role
- Returns: Array of claim objects

PATCH /api/admin/youtube-claims/:id
- Update claim status and notes
- Requires: Admin role
- Body: { status: string, notes?: string }
- Returns: Updated claim object
```

## Usage Examples

### User Submitting a Claim

1. Log in to the application
2. Click "YouTube Claim" in the navigation
3. (Optional) Select a release from the dropdown
4. Enter YouTube URLs:
   ```
   https://youtube.com/watch?v=abc123,
   https://youtube.com/watch?v=def456,
   https://youtube.com/watch?v=ghi789
   ```
5. Click "Submit"
6. View the claim in the History table

### Admin Managing Claims

1. Log in as admin
2. Navigate to Admin Dashboard
3. Click "YouTube Claims" button
4. See summary statistics at the top
5. Click "Manage" on any claim
6. Update status and add notes
7. Click "Update Status"

## UI Components

### User Page (`/youtube-claim`)
- Release selection dropdown (optional)
- Multi-line text area for URLs
- Submit button
- History table with:
  - Serial number
  - Video URLs (clickable links)
  - Submission date
  - Status badge
  - Admin notes (if any)

### Admin Page (`/admin/youtube-claims`)
- Status summary cards (4 cards showing counts)
- Claims table with:
  - User ID
  - Video URLs (truncated, clickable)
  - Submission date
  - Status badge
  - Manage button
- Modal for updating status:
  - Status dropdown
  - Notes textarea
  - Update/Cancel buttons

## Files Created/Modified

### New Files
1. `src/server/routes/youtube-claim.routes.ts` - User API routes
2. `src/client/routes/youtube-claim.tsx` - User page
3. `src/client/routes/admin-youtube-claims.tsx` - Admin page
4. `YOUTUBE_CLAIM_FEATURE.md` - This documentation

### Modified Files
1. `supabase-enhanced-schema.sql` - Added youtube_claims table
2. `src/server/db.ts` - Added youtubeClaimOperations
3. `src/server/index.ts` - Registered youtube-claim routes
4. `src/server/routes/admin.routes.ts` - Added admin endpoints
5. `src/client/api.ts` - Added YouTube claim API methods
6. `src/client/App.tsx` - Registered routes
7. `src/client/components/Navbar.tsx` - Added navigation link
8. `src/client/routes/admin.tsx` - Added YouTube Claims button

## Migration

To add the YouTube claims table to your database:

1. **Using Supabase Dashboard:**
   - Go to SQL Editor
   - Copy the relevant section from `supabase-enhanced-schema.sql`
   - Execute the SQL

2. **Key SQL to run:**
```sql
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_youtube_claims_user_id ON youtube_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_release_id ON youtube_claims(release_id);
CREATE INDEX IF NOT EXISTS idx_youtube_claims_status ON youtube_claims(status);

-- Enable RLS
ALTER TABLE youtube_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Service role has full access to youtube_claims" ON youtube_claims
  FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_youtube_claims_updated_at ON youtube_claims;
CREATE TRIGGER update_youtube_claims_updated_at BEFORE UPDATE ON youtube_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Security

- ✅ Authentication required for all endpoints
- ✅ Users can only view their own claims
- ✅ Only admins can view all claims
- ✅ Only admins can update claim status
- ✅ Row Level Security (RLS) enabled
- ✅ Input validation on all endpoints

## Future Enhancements

Potential improvements:
- Email notifications when status changes
- Bulk status updates
- Export claims to CSV
- Filter/search functionality
- Claim analytics and reporting
- Integration with YouTube API for automatic claiming
- File attachments for proof of ownership
- Comment thread between user and admin

## Testing

To test the feature:

1. **As User:**
   ```bash
   # Create a test claim
   curl -X POST http://localhost:3000/api/youtube-claims \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"videoUrls": "https://youtube.com/watch?v=test123"}'
   
   # Get your claims
   curl http://localhost:3000/api/youtube-claims \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **As Admin:**
   ```bash
   # Get all claims
   curl http://localhost:3000/api/admin/youtube-claims \
     -H "Authorization: Bearer ADMIN_TOKEN"
   
   # Update claim status
   curl -X PATCH http://localhost:3000/api/admin/youtube-claims/CLAIM_ID \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "COMPLETED", "notes": "Claim processed successfully"}'
   ```

## Status

🟢 **COMPLETE** - Feature fully implemented and ready to use
- Database schema created
- API endpoints implemented
- User interface complete
- Admin interface complete
- Navigation integrated
- Security implemented
