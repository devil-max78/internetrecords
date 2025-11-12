# Resubmission Feature Summary

## Changes Implemented

### 1. New RESUBMITTED Status
- Added `RESUBMITTED` status to track when users resubmit rejected releases
- Database migration: `add-resubmitted-status.sql`
- Status badge shows blue color for resubmitted releases

### 2. Audio File Required
- Audio file upload is now mandatory for all tracks
- Shows red asterisk (*) next to "Audio File" label
- Validation error if user tries to submit without audio
- Error message: "Audio file is required for track: [track name]"

### 3. Duration Field Removed
- Removed duration input field from upload form
- Duration will be automatically detected from audio file (future enhancement)
- Simplified track creation process

### 4. Album Art Display in Dashboard
- Increased artwork height from 160px to 192px (h-48)
- Better image display with proper error handling
- Fallback to gradient if artwork fails to load
- Uses direct artwork URL (Supabase storage)

### 5. Edit Capabilities for Rejected Releases
- Users can add tracks to rejected releases (if resubmission allowed)
- Shows rejection reason prominently on release detail page
- Clear messaging about editing limitations
- Guidance to create new release for full edits

### 6. Resubmission Logic
- When rejected release is submitted again, status changes to `RESUBMITTED`
- Rejection reason is cleared upon resubmission
- Admin can see it's a resubmission vs first-time submission
- Button text changes to "Resubmit for Review"

### 7. Status-Based Editing
- **DRAFT**: Full edit capabilities
- **UNDER_REVIEW**: Can add tracks
- **REJECTED** (if allowed): Can add tracks and resubmit
- **REJECTED** (if not allowed): No edit capabilities
- **APPROVED/DISTRIBUTED**: No edit capabilities

## Files Modified

### Backend
- `src/server/routes/release.routes.ts` - Updated submit endpoint to handle resubmission
- `add-resubmitted-status.sql` - Database migration for new status

### Frontend
- `src/client/routes/upload-enhanced.tsx` - Made audio required, removed duration
- `src/client/routes/dashboard.tsx` - Enhanced artwork display
- `src/client/routes/release-detail.tsx` - Added rejection reason display, resubmission UI
- `src/client/components/StatusBadge.tsx` - Added RESUBMITTED status styling

## User Flow

### For Rejected Releases (Resubmission Allowed)

1. **User sees rejection on dashboard**:
   - Red alert box with rejection reason
   - "✓ You can edit and resubmit this release"

2. **User clicks on release**:
   - Views rejection reason again
   - Sees guidance about editing limitations
   - Can add new tracks (basic info only)

3. **User clicks "Resubmit for Review"**:
   - Status changes to `RESUBMITTED`
   - Rejection reason is cleared
   - Release goes back to admin queue

4. **Admin sees resubmitted release**:
   - Blue "Resubmitted" badge
   - Can review and approve/reject again

### For Rejected Releases (Resubmission Not Allowed)

1. **User sees rejection on dashboard**:
   - Red alert box with rejection reason
   - "✗ Resubmission not allowed. Please contact support."

2. **User clicks on release**:
   - Views rejection reason
   - No edit options available
   - Must contact support

## Status Colors

- **DRAFT**: Gray
- **UNDER_REVIEW**: Yellow
- **RESUBMITTED**: Blue ✨ NEW
- **APPROVED**: Green
- **REJECTED**: Red
- **DISTRIBUTED**: Indigo

## Benefits

1. **Clear Workflow**: Users know exactly what to do after rejection
2. **Transparency**: Rejection reasons are visible throughout
3. **Flexibility**: Admins control resubmission permissions
4. **Tracking**: RESUBMITTED status helps admins prioritize
5. **Simplified Upload**: Audio required, duration removed
6. **Better UX**: Larger artwork, clearer messaging

## Limitations & Future Enhancements

### Current Limitations
- Release detail page only allows basic track additions
- Cannot edit existing tracks
- Cannot change release metadata
- Cannot upload new audio files for existing tracks

### Recommended Approach for Full Edits
Users should create a new release with corrected information rather than trying to edit rejected releases extensively.

### Future Enhancements
- Full edit mode for rejected releases
- Track editing capabilities
- Audio file replacement
- Automatic duration detection from audio files
- Bulk track upload
- Draft auto-save

## Testing Checklist

- [ ] Upload release without audio file (should fail)
- [ ] Upload release with audio file (should succeed)
- [ ] Admin rejects release with custom reason
- [ ] User sees rejection reason on dashboard
- [ ] User can add tracks to rejected release
- [ ] User resubmits release
- [ ] Status changes to RESUBMITTED
- [ ] Admin sees RESUBMITTED status
- [ ] Artwork displays correctly on dashboard
- [ ] Duration field is not visible in upload form

---

**Status**: ✅ Implemented
**Version**: 1.1.0
**Date**: November 2025
