# Rejection Reason Feature

## Overview
Added comprehensive rejection reason system with admin controls and user visibility.

## Features Implemented

### 1. Database Changes
**File**: `add-rejection-reason.sql`

New columns added to `releases` table:
- `rejection_reason` (TEXT) - Stores admin's custom rejection reason
- `allow_resubmission` (BOOLEAN) - Controls if user can edit and resubmit (default: true)
- `rejected_at` (TIMESTAMP) - Timestamp of rejection

### 2. Admin Features

#### Rejection Dialog
- Custom rejection reason input (required)
- Checkbox to allow/disallow resubmission
- Validation to ensure reason is provided

#### Email Notification
- Includes rejection reason in email
- Different message based on resubmission permission:
  - **Allowed**: "You can edit and resubmit your track"
  - **Not Allowed**: "Please contact support for more information"

### 3. User Features

#### Dashboard Display
- Shows rejection reason in red alert box
- Indicates if resubmission is allowed
- Visual indicators:
  - ✓ You can edit and resubmit this release
  - ✗ Resubmission not allowed. Please contact support.

### 4. API Changes

**Backend** (`src/server/routes/admin.routes.ts`):
```typescript
POST /api/admin/releases/:id/reject
Body: {
  rejectionReason: string,
  allowResubmission: boolean
}
```

**Frontend** (`src/client/api.ts`):
```typescript
api.admin.rejectRelease(id, rejectionReason, allowResubmission)
```

## Usage

### For Admins

1. Click "Reject" button on a release
2. Rejection dialog appears with:
   - Text area for rejection reason (required)
   - Checkbox for "Allow user to edit and resubmit" (checked by default)
3. Enter detailed reason explaining why the release is rejected
4. Choose whether to allow resubmission
5. Click "Confirm Reject"

### For Users

1. View dashboard
2. Rejected releases show:
   - Red alert box with rejection reason
   - Resubmission status
3. If resubmission allowed:
   - User can edit the release
   - User can resubmit for review
4. If resubmission not allowed:
   - User must contact support
   - Cannot edit or resubmit

## Example Rejection Reasons

### Quality Issues
- "Audio quality does not meet our standards. Please re-record with better equipment."
- "Mastering issues detected. Track has clipping and distortion."
- "Background noise present throughout the track."

### Content Issues
- "Explicit content not properly labeled."
- "Copyright concerns with the submitted material."
- "Track does not match the genre classification."

### Technical Issues
- "Audio file is corrupted or incomplete."
- "Metadata is missing or incorrect."
- "ISRC code is invalid or already in use."

## Database Migration

Run the migration:
```sql
-- Execute add-rejection-reason.sql
psql -d your_database < add-rejection-reason.sql
```

Or in Supabase SQL Editor:
1. Open SQL Editor
2. Paste contents of `add-rejection-reason.sql`
3. Run query

## Files Modified

### Backend
- `src/server/routes/admin.routes.ts` - Updated reject endpoint
- `src/server/email.ts` - Updated email template params

### Frontend
- `src/client/routes/admin.tsx` - Added rejection dialog
- `src/client/routes/dashboard.tsx` - Added rejection reason display
- `src/client/api.ts` - Updated API method signature

### Database
- `add-rejection-reason.sql` - Migration script

### Email
- `emailjs-template.html` - Already supports dynamic status messages

## Benefits

1. **Transparency**: Users know exactly why their release was rejected
2. **Efficiency**: Clear feedback reduces back-and-forth communication
3. **Control**: Admins can prevent resubmission for serious violations
4. **User Experience**: Users can fix issues and resubmit when allowed
5. **Accountability**: Rejection reasons are logged with timestamps

## Future Enhancements

Potential improvements:
- Predefined rejection reason templates
- Multiple rejection reasons (checkboxes)
- Rejection reason categories
- Appeal system for rejected releases
- Rejection statistics and analytics
- Automated quality checks before admin review

---

**Status**: ✅ Implemented and Ready to Use
**Version**: 1.0.0
**Date**: November 2025
