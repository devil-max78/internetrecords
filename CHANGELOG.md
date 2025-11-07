# Changelog - Internet Records Distribution Platform

All notable changes and features added to this project.

---

## 🎨 Branding Update

### Changed
- **Platform Name**: Updated from "Music Distribution" to "Internet Records"
- **Logo**: Created custom SVG logo with headphones icon
- **Navbar**: Updated branding across all pages
- **Files Modified**:
  - `src/client/components/Navbar.tsx`
  - `public/assets/logo.svg`

**Documentation**: `BRANDING_UPDATE.md`

---

## 🎵 YouTube Claim Release Feature

### Added
- User interface for submitting YouTube content claims
- Video URL submission (multiple URLs supported)
- Optional release association
- Claim status tracking (Pending, Processing, Completed, Rejected)
- Admin dashboard for managing claims
- Status update functionality with admin notes

### Database Changes
- New table: `youtube_claims`
  - Fields: id, user_id, release_id, video_urls, status, notes, processed_at, created_at, updated_at

### API Endpoints
- `POST /api/youtube-claims` - Submit new claim
- `GET /api/youtube-claims` - Get user's claims
- `GET /api/youtube-claims/:id` - Get specific claim
- `GET /api/admin/youtube-claims` - Admin: Get all claims
- `PATCH /api/admin/youtube-claims/:id` - Admin: Update claim status

### Files Created
- `src/client/routes/youtube-claim.tsx`
- `src/client/routes/admin-youtube-claims.tsx`
- `src/server/routes/youtube-claim.routes.ts`
- `scripts/add-youtube-claims.sql`

**Documentation**: `YOUTUBE_CLAIM_FEATURE.md`, `YOUTUBE_CLAIM_SUMMARY.md`, `YOUTUBE_CLAIM_QUICKSTART.md`

---

## 📺 YouTube OAC (Official Artist Channel) Request System

### Added
- Request form for YouTube Official Artist Channel verification
- Eligibility requirements display
- Channel link, legal name, and channel name fields
- Status tracking (Pending, Processing, Approved, Rejected)
- Admin dashboard for managing OAC requests
- Admin notes functionality

### Database Changes
- New table: `youtube_oac_requests`
  - Fields: id, user_id, channel_link, legal_name, channel_name, status, admin_notes, processed_at, created_at, updated_at

### API Endpoints
- `POST /api/youtube-oac` - Submit OAC request
- `GET /api/youtube-oac` - Get user's requests
- `GET /api/youtube-oac/:id` - Get specific request
- `GET /api/admin/youtube-oac-requests` - Admin: Get all requests
- `PATCH /api/admin/youtube-oac-requests/:id` - Admin: Update request status

### Files Created
- `src/client/routes/youtube-oac.tsx`
- `src/server/routes/youtube-oac.routes.ts`
- `scripts/add-youtube-oac.sql`

---

## 📱 Social Media Linking Request System

### Added
- Request form for Facebook and Instagram profile linking
- Platform selection (Facebook, Instagram, or both)
- Facebook Page URL and Instagram handle fields
- ISRC code input for track identification
- Status tracking system
- Admin dashboard for managing requests

### Database Changes
- New table: `social_media_linking_requests`
  - Fields: id, user_id, email, label, platforms, facebook_page_url, instagram_handle, isrc, status, admin_notes, created_at, updated_at

### API Endpoints
- `POST /api/social-media-linking` - Submit linking request
- `GET /api/social-media-linking` - Get user's requests
- `GET /api/admin/social-media-linking` - Admin: Get all requests
- `PATCH /api/admin/social-media-linking/:id` - Admin: Update request status

### Files Created
- `src/client/routes/social-media-linking.tsx`
- `src/server/routes/social-media-linking.routes.ts`
- `scripts/add-social-media-linking.sql`

---

## ⚙️ Admin Settings Enhancement

### Added
- Centralized admin settings page
- Dropdown management for:
  - Sub-labels
  - Publishers
  - Album Categories
  - Content Types
- CRUD operations (Create, Read, Delete)
- Usage validation before deletion
- User role management
- User list with role update functionality

### Features
- Add new items to each dropdown category
- Delete items with safety checks
- View all users and their roles
- Update user roles (Artist, Label, Admin)
- Real-time updates with React Query

### Database Changes
- Fixed `sub_labels` table: Made `user_id` nullable for global sub-labels
- Migration: `FIX_SUB_LABELS_NOW.sql`
- Additional fix: `FIX_ADMIN_SETTINGS.sql`

### API Endpoints
- `POST /api/admin/sub-labels` - Create sub-label
- `DELETE /api/admin/sub-labels/:id` - Delete sub-label
- `POST /api/admin/publishers` - Create publisher
- `DELETE /api/admin/publishers/:id` - Delete publisher
- `POST /api/admin/album-categories` - Create album category
- `DELETE /api/admin/album-categories/:id` - Delete album category
- `POST /api/admin/content-types` - Create content type
- `DELETE /api/admin/content-types/:id` - Delete content type
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role

### Files Modified
- `src/client/routes/admin-settings.tsx`
- `src/server/routes/admin.routes.ts`

**Documentation**: `ADMIN_SETTINGS_GUIDE.md`, `ADMIN_SETTINGS_SUMMARY.md`

---

## 🎼 Track Metadata Enhancement

### Added
- Extended track metadata fields:
  - **Lyricist**: Person who wrote the lyrics
  - **Composer**: Person who composed the music
  - **Producer**: Track producer
  - **Singer**: Vocalist/singer
  - **Featuring**: Featured artists

### Database Changes
- Added columns to `tracks` table:
  - `lyricist` (VARCHAR 255)
  - `composer` (VARCHAR 255)
  - `producer` (VARCHAR 255)
  - `singer` (VARCHAR 255)
  - `featuring` (VARCHAR 255)
- Migration: `add-track-credits.sql`

### Files Modified
- `src/client/routes/upload-enhanced.tsx`
- Database schema files

---

## 🏷️ Label & Publisher System Refactor

### Added
- Global default label and publisher settings
- User-specific custom labels and publishers
- User preference selection system
- Dropdown management interface

### Features
- View global defaults (Internet Records)
- Create custom labels per user
- Create custom publishers per user
- Select active label (custom or global default)
- Select active publisher (custom or global default)
- Delete custom labels/publishers

### Database Changes
- New table: `global_settings`
  - Stores system-wide defaults
- New table: `user_labels`
  - User-specific custom labels
- New table: `user_publishers`
  - User-specific custom publishers
- Extended `users` table:
  - `custom_label` (VARCHAR 255)
  - `custom_publisher` (VARCHAR 255)
- Migration: `label-publisher-refactor.sql`

### API Endpoints
- `GET /api/label-publisher/global-defaults` - Get global defaults
- `GET /api/label-publisher/user-labels` - Get user's labels
- `GET /api/label-publisher/user-publishers` - Get user's publishers
- `POST /api/label-publisher/user-labels` - Create label
- `POST /api/label-publisher/user-publishers` - Create publisher
- `DELETE /api/label-publisher/user-labels/:id` - Delete label
- `DELETE /api/label-publisher/user-publishers/:id` - Delete publisher
- `GET /api/label-publisher/user-preferences` - Get preferences
- `PUT /api/label-publisher/user-preferences` - Update preferences

### Files Created
- `src/client/routes/label-publisher-settings.tsx`
- `src/server/routes/label-publisher.routes.ts`
- `label-publisher-refactor.sql`

**Documentation**: `LABEL_PUBLISHER_GUIDE.md`

---

## 🎵 Audio Upload Restriction

### Changed
- **Audio Format**: Restricted to MP3 only
- **Removed Support**: WAV and FLAC no longer accepted

### Implementation
- Client-side validation: File extension and MIME type check
- Server-side validation: File extension verification
- User feedback: Error toast for invalid files
- Updated UI: Label indicates "MP3 only"

### Files Modified
- `src/client/routes/upload-enhanced.tsx`
- `src/server/routes/upload.routes.ts`

**Documentation**: `MP3_ONLY_UPLOAD.md`

---

## 🐛 Bug Fixes

### Fixed
- **TypeScript Errors**: Unused `req` parameters in admin routes
  - Fixed 4 instances in `src/server/routes/admin.routes.ts`
  - Prefixed with underscore to indicate intentionally unused
- **Authentication Import**: Fixed `authenticateToken` to `authMiddleware`
- **Database Operations**: Fixed Supabase query patterns in label-publisher routes
- **Foreign Key Constraints**: Added usage checks before deletion in admin settings
- **Sub-labels User ID**: Made nullable to support global sub-labels

---

## 📚 Documentation Created

### Guides
- `BRANDING_UPDATE.md` - Branding changes documentation
- `YOUTUBE_CLAIM_FEATURE.md` - YouTube claim feature details
- `YOUTUBE_CLAIM_SUMMARY.md` - Quick summary of claim feature
- `YOUTUBE_CLAIM_QUICKSTART.md` - Quick start guide
- `ADMIN_SETTINGS_GUIDE.md` - Admin settings usage guide
- `ADMIN_SETTINGS_SUMMARY.md` - Admin settings summary
- `LABEL_PUBLISHER_GUIDE.md` - Label & publisher system guide
- `MP3_ONLY_UPLOAD.md` - Audio upload restriction details
- `LOCALHOST_VIEWING_GUIDE.md` - Local development guide
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `MIGRATION_GUIDE.md` - Database migration guide
- `COMPLETE_SETUP_GUIDE.md` - Complete setup instructions
- `SUPABASE_SETUP.md` - Supabase configuration guide
- `SUPABASE_AUTH_GUIDE.md` - Authentication setup guide
- `REST_API_MIGRATION.md` - API migration documentation
- `PROJECT_STATUS.md` - Project status overview
- `FINAL_STATUS.md` - Final implementation status

### Migration Scripts
- `scripts/add-youtube-claims.sql`
- `scripts/add-youtube-oac.sql`
- `scripts/add-social-media-linking.sql`
- `scripts/add-track-credits.sql`
- `scripts/migrate-sublabels-global.js`
- `label-publisher-refactor.sql`
- `FIX_SUB_LABELS_NOW.sql`
- `FIX_ADMIN_SETTINGS.sql`

---

## 🔧 Technical Improvements

### Architecture
- Migrated from Prisma to Supabase direct queries
- Implemented proper RLS (Row Level Security) policies
- Added snake_case to camelCase conversion utilities
- Improved error handling across all endpoints
- Added proper TypeScript types throughout

### Security
- Authentication middleware implementation
- Admin-only route protection
- User data isolation with RLS
- Token-based authentication with Supabase Auth
- Proper authorization checks on all endpoints

### Database
- Supabase PostgreSQL backend
- Proper foreign key relationships
- Cascade delete policies
- Indexed columns for performance
- Timestamp tracking (created_at, updated_at)

### Frontend
- React with TypeScript
- TanStack Router for routing
- React Query for data fetching
- React Hook Form for form management
- Tailwind CSS for styling
- Toast notifications for user feedback

### Backend
- Express.js REST API
- Supabase client for database operations
- File upload with presigned URLs
- Proper error handling and logging
- Environment variable configuration

---

## 📊 Database Schema Summary

### Core Tables
- `users` - User accounts and profiles
- `releases` - Music releases
- `tracks` - Individual tracks
- `file_uploads` - File upload records

### Metadata Tables
- `sub_labels` - Sub-label options
- `publishers` - Publisher options
- `album_categories` - Album category options
- `content_types` - Content type options
- `artists` - Artist records

### Feature Tables
- `youtube_claims` - YouTube content claims
- `youtube_oac_requests` - OAC verification requests
- `social_media_linking_requests` - Social media linking requests
- `global_settings` - System-wide settings
- `user_labels` - User-specific labels
- `user_publishers` - User-specific publishers

---

## 🚀 Deployment

### Platform
- Deployed on Render.com
- PostgreSQL database via Supabase
- File storage via Supabase Storage
- Environment variables configured
- Automatic deployments from Git

### Configuration Files
- `railway.json` - Deployment configuration
- `.env` - Environment variables (not in repo)
- `package.json` - Dependencies and scripts

---

## 📝 Notes

### Migration Order
1. Run base schema migrations first
2. Apply feature-specific migrations
3. Run fix migrations if needed
4. Verify tables with verification scripts

### Environment Setup
- Node.js and npm required
- Supabase account and project
- Environment variables configured
- Database migrations applied

### Development
- Local development server: `npm run dev`
- Client runs on port 5173
- Server runs on port 3000
- Hot reload enabled for development

---

## 🚀 Vercel Deployment Optimization

### Added
- Vercel serverless deployment configuration
- Multi-platform deployment support (Render + Vercel)
- Serverless function wrapper for Express app

### Features
- Deploy to Vercel without breaking Render deployment
- Automatic preview deployments for pull requests
- Global CDN for static assets
- Serverless API functions
- Zero-config deployments

### Configuration Files Created
- `vercel.json` - Vercel deployment configuration
- `api/index.js` - Serverless function wrapper
- `.vercelignore` - Deployment optimization

### Documentation Created
- `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- `DEPLOYMENT_COMPARISON.md` - Platform comparison (Render vs Vercel vs Netlify)
- `VERCEL_SETUP_CHECKLIST.md` - Step-by-step checklist
- `VERCEL_OPTIMIZATION_SUMMARY.md` - Technical summary

### Files Modified
- `src/server/index.ts` - Added serverless export and conditional startup
- `package.json` - Added `vercel-build` script

### Architecture
- **Render**: Traditional server (production)
- **Vercel**: Serverless functions (staging/preview)
- **Same Codebase**: Works on both platforms

### Benefits
- ✅ No additional cost (Vercel free tier for staging)
- ✅ Preview URLs for every PR
- ✅ Faster deployments (~2 min vs ~5 min)
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ Instant rollbacks
- ✅ Keep Render for production stability

### Why Not Netlify
- Netlify requires complete restructuring
- Not compatible with Express monolithic architecture
- Would need to split routes into individual functions
- Not recommended for this project

### Deployment Strategy
1. **Production**: Render (stable, no cold starts)
2. **Staging**: Vercel (fast, preview deployments)
3. **Development**: Local (`npm run dev`)

**Documentation**: `VERCEL_DEPLOYMENT.md`, `DEPLOYMENT_COMPARISON.md`, `VERCEL_SETUP_CHECKLIST.md`

---

**Last Updated**: November 6, 2025
**Project**: Internet Records Distribution Platform
**Version**: 1.0.0
