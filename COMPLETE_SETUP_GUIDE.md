# 🎉 Music Distribution Platform - Complete Setup Guide

## ✅ Project Status: FULLY OPERATIONAL

Your music distribution platform is now fully functional with:
- ✅ Supabase Auth integration
- ✅ REST API (no tRPC)
- ✅ Supabase Database
- ✅ Supabase Storage
- ✅ Admin user ready

---

## 🚀 Quick Start

### 1. Access the Application

**Frontend**: http://localhost:5173
**Backend API**: http://localhost:3000/api

### 2. Login

**Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### 3. Create New Accounts

Users can signup at http://localhost:5173/signup
- Choose role: Artist or Label
- Instant access after signup

---

## 📁 Project Structure

```
music-distribution/
├── src/
│   ├── client/              # React frontend
│   │   ├── routes/          # Page components
│   │   ├── context/         # Auth context
│   │   ├── api.ts           # API client
│   │   └── App.tsx          # Main app
│   └── server/              # Express backend
│       ├── routes/          # REST API routes
│       ├── middleware/      # Auth middleware
│       ├── storage.ts       # Supabase Storage
│       ├── db.ts            # Database wrapper
│       └── index.ts         # Server entry
├── scripts/                 # Utility scripts
├── supabase-migration.sql   # Database schema
└── .env                     # Environment variables
```

---

## 🔐 Authentication System

### Supabase Auth Features

- **Secure Password Hashing**: Managed by Supabase
- **Session Management**: Access & refresh tokens
- **Email Verification**: Ready to enable
- **OAuth Providers**: Can add Google, GitHub, etc.

### API Endpoints

```
POST /api/auth/login       - User login
POST /api/auth/signup      - User registration
POST /api/auth/logout      - User logout
POST /api/auth/refresh     - Refresh access token
GET  /api/auth/me          - Get current user
```

---

## 📡 REST API Endpoints

### Releases

```
GET    /api/releases              - Get all releases
GET    /api/releases/:id          - Get single release
POST   /api/releases              - Create release
PUT    /api/releases/:id          - Update release
POST   /api/releases/:id/submit   - Submit for review
```

### Tracks

```
POST   /api/releases/:id/tracks   - Add track
PUT    /api/releases/tracks/:id   - Update track
DELETE /api/releases/tracks/:id   - Delete track
```

### Upload

```
POST /api/upload/presigned-url    - Get upload URL
POST /api/upload/track-audio      - Update track audio
```

### Admin

```
POST /api/admin/releases/:id/approve     - Approve release
POST /api/admin/releases/:id/reject      - Reject release
POST /api/admin/releases/:id/distribute  - Distribute release
GET  /api/admin/releases/:id/downloads   - Get download URLs
GET  /api/admin/releases/:id/metadata/json - Get metadata JSON
GET  /api/admin/releases/:id/metadata/csv  - Get metadata CSV
```

---

## 🗄️ Database Schema

### Tables

**users**
- id (UUID, primary key)
- email (unique)
- name
- password (empty - managed by Supabase Auth)
- role (ARTIST, LABEL, ADMIN)
- created_at, updated_at

**releases**
- id (UUID, primary key)
- title
- status (DRAFT, UNDER_REVIEW, APPROVED, REJECTED, DISTRIBUTED)
- artwork_url
- user_id (foreign key)
- created_at, updated_at

**tracks**
- id (UUID, primary key)
- title
- duration (seconds)
- genre, language, isrc
- audio_url
- release_id (foreign key)
- created_at, updated_at

**file_uploads**
- id (UUID, primary key)
- file_type (AUDIO, ARTWORK, METADATA)
- url
- release_id (foreign key)
- created_at, updated_at

---

## 📦 Storage

### Supabase Storage Bucket

**Bucket Name**: `music-files`
**Structure**: `{releaseId}/{fileType}/{uniqueId}.{extension}`

**File Types:**
- Audio files (MP3, WAV, FLAC)
- Artwork images (JPG, PNG)
- Metadata files (JSON)

**Features:**
- Signed upload URLs (1 hour expiry)
- Signed download URLs (1 hour expiry)
- 50MB file size limit

---

## 🛠️ Utility Scripts

### Admin Management

```bash
# Create admin user
node scripts/create-supabase-admin.js

# Fix admin user ID
node scripts/fix-admin.js

# Reset admin password
node scripts/reset-admin-password.js

# List all users
node scripts/list-users.js
```

### Testing

```bash
# Test REST API
node test-api.js

# Test Supabase Auth
node test-supabase-auth.js
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# App
APP_NAME=music-distribution
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin User
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_NAME="Admin User"
ADMIN_INITIAL_PASSWORD=admin123

# JWT (for backward compatibility)
JWT_SECRET=your-jwt-secret
```

---

## 🎯 User Workflows

### Artist/Label Workflow

1. **Signup** → Create account
2. **Login** → Access dashboard
3. **Create Release** → Add title
4. **Add Tracks** → Upload audio, add metadata
5. **Submit for Review** → Send to admin
6. **Wait for Approval** → Admin reviews
7. **Release Distributed** → Available to public

### Admin Workflow

1. **Login** → Access admin dashboard
2. **View Releases** → See all submissions
3. **Review Release** → Check tracks and metadata
4. **Approve/Reject** → Make decision
5. **Distribute** → Mark as distributed
6. **Download Files** → Get audio and metadata
7. **Export Metadata** → CSV or JSON

---

## 🧪 Testing Guide

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Test Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"artist@example.com",
    "password":"password123",
    "name":"Test Artist",
    "role":"ARTIST"
  }'
```

### Test Protected Route

```bash
# Get token from login first
TOKEN="your-token-here"

curl http://localhost:3000/api/releases \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: Can't login

**Solution:**
1. Check if admin user exists: `node scripts/list-users.js`
2. Create admin: `node scripts/create-supabase-admin.js`
3. Fix admin ID: `node scripts/fix-admin.js`

### Issue: "Invalid token"

**Solution:**
- Token expired → Use refresh token
- Wrong format → Ensure "Bearer " prefix
- Check Supabase service role key

### Issue: Database connection error

**Solution:**
- Verify SUPABASE_URL in .env
- Verify SUPABASE_SERVICE_ROLE_KEY
- Check Supabase project is active

### Issue: File upload fails

**Solution:**
- Check storage bucket exists
- Verify bucket name: `music-files`
- Check file size (max 50MB)

---

## 📊 Features

### Implemented ✅

- User authentication (Supabase Auth)
- Role-based access control
- Release management (CRUD)
- Track management
- File uploads (Supabase Storage)
- Admin approval workflow
- Metadata export (JSON/CSV)
- Session management
- Token refresh

### Ready to Add 🚀

- Email verification
- Password reset
- OAuth providers (Google, GitHub)
- File upload UI with progress
- Audio player
- Release analytics
- User profiles
- Notifications

---

## 🔒 Security

### Current Security Features

- ✅ Supabase Auth (industry standard)
- ✅ Password hashing (bcrypt via Supabase)
- ✅ JWT tokens with expiry
- ✅ Refresh token rotation
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ CORS enabled
- ✅ Environment variables

### Recommendations for Production

1. Enable email verification
2. Add rate limiting
3. Enable HTTPS only
4. Add input validation
5. Enable Supabase RLS policies
6. Add API request logging
7. Set up monitoring
8. Add backup strategy

---

## 📝 Development Commands

```bash
# Start both servers
npm run dev

# Start backend only
npm run dev:server

# Start frontend only
npm run dev:client

# Create admin user
node scripts/create-supabase-admin.js

# Test API
node test-api.js
```

---

## 🎉 Success Checklist

- ✅ Backend server running (port 3000)
- ✅ Frontend server running (port 5173)
- ✅ Supabase database connected
- ✅ Supabase Storage initialized
- ✅ Admin user created
- ✅ Authentication working
- ✅ API endpoints functional
- ✅ File uploads ready

---

## 📞 Support

If you encounter issues:

1. Check server logs in terminal
2. Check browser console for errors
3. Verify environment variables
4. Run utility scripts to fix common issues
5. Check Supabase dashboard for errors

---

## 🎊 You're All Set!

Your music distribution platform is ready to use!

**Start here**: http://localhost:5173
**Login with**: admin@example.com / admin123

Enjoy building your music distribution platform! 🎵
