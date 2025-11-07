# Vercel Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- ✅ Project builds successfully: `npm run build`
- ✅ Code pushed to GitHub
- ✅ Supabase credentials ready

---

## Step 1: Create Vercel Account (1 min)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

---

## Step 2: Import Project (1 min)

1. Click "Add New..." → "Project"
2. Find your repository
3. Click "Import"
4. Vercel auto-detects settings from `vercel.json`

---

## Step 3: Configure Environment Variables (2 min)

Add these in the import screen:

```
SUPABASE_URL = your_supabase_project_url
SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
JWT_SECRET = your_jwt_secret
NODE_ENV = production
```

**Where to find Supabase credentials**:
- Go to your Supabase project
- Settings → API
- Copy URL and keys

---

## Step 4: Deploy (1 min)

1. Click "Deploy"
2. Wait for build (~2-3 minutes)
3. Get deployment URL: `your-app.vercel.app`

---

## Step 5: Test (30 seconds)

### Test Health Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Vercel serverless function running"
}
```

### Test Frontend
1. Visit `https://your-app.vercel.app`
2. Should see login page
3. No blank white screen ✅

---

## ✅ Success!

Your app is now deployed on Vercel!

### What You Get
- 🌍 Global CDN
- 🔄 Auto-deploy on git push
- 🔍 Preview URLs for PRs
- 📊 Analytics dashboard
- 🔒 Free SSL certificate
- ⚡ Automatic scaling

---

## Next Steps

### Optional: Custom Domain
1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records
4. Wait for SSL (~5 minutes)

### Optional: Enable Analytics
1. Go to Analytics tab
2. Click "Enable"
3. Monitor traffic and performance

---

## Troubleshooting

### Blank White Screen?
1. Check browser console (F12)
2. Verify environment variables in Vercel dashboard
3. Check build logs
4. Test `/api/health` endpoint

### API Not Working?
1. Go to Vercel Dashboard → Functions
2. Check `api/index.js` logs
3. Verify Supabase credentials
4. Test with curl/Postman

---

## Commands

### Redeploy
```bash
git push origin main
```

### Deploy from CLI
```bash
npm install -g vercel
vercel --prod
```

### Local Testing
```bash
vercel dev
```

---

## Support

- **Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Support**: [vercel.com/support](https://vercel.com/support)
- **Status**: [vercel-status.com](https://vercel-status.com)

---

## Keep Render Running

✅ **Yes!** Keep your Render deployment for production.

Use:
- **Render**: Production (stable, no cold starts)
- **Vercel**: Staging/Preview (fast, free)

Both can run simultaneously with the same codebase!

---

**That's it!** Your app is now on Vercel. 🎉

For detailed information, see:
- `VERCEL_DEPLOYMENT.md` - Complete guide
- `VERCEL_SETUP_CHECKLIST.md` - Detailed checklist
- `DEPLOYMENT_COMPARISON.md` - Platform comparison
