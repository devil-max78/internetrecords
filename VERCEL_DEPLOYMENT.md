# Vercel Deployment Guide

## Overview
This guide explains how to deploy the Internet Records Distribution Platform on Vercel while keeping the Render deployment working.

## Architecture

### Render (Current Working Setup)
- Monolithic Express server serving both API and static files
- Single process handling all requests
- Uses `src/server/index.ts` directly

### Vercel (New Setup)
- Serverless functions for API routes
- Static file hosting for frontend
- Uses `api/index.js` as serverless function wrapper
- Frontend served from `dist/client`

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Built Project**: Run `npm run build` locally to ensure it builds successfully
3. **Environment Variables**: Have your Supabase credentials ready

## Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow prompts**:
   - Link to existing project or create new
   - Confirm settings
   - Wait for deployment

### Option 2: Deploy via Git Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel configuration"
   git push
   ```

2. **Import in Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect settings from `vercel.json`

3. **Configure Environment Variables**:
   - Add all required environment variables
   - Deploy

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### api/index.js
Serverless function wrapper that:
- Loads compiled Express routes
- Sets up middleware (CORS, JSON parsing)
- Handles API requests
- Provides error handling

## How It Works

### Build Process
1. `npm run build` runs:
   - `vite build` → Builds React frontend to `dist/client`
   - `tsc -p tsconfig.server.json` → Compiles TypeScript server to `dist/server`

2. Vercel deployment:
   - Serves `dist/client` as static files
   - Runs `api/index.js` as serverless function for `/api/*` routes

### Request Flow

**Frontend Requests** (`/`, `/login`, `/dashboard`, etc.):
- Served from `dist/client/index.html`
- React Router handles client-side routing

**API Requests** (`/api/*`):
- Routed to `api/index.js` serverless function
- Function loads compiled routes from `dist/server/routes`
- Processes request and returns response

## Differences from Render

| Feature | Render | Vercel |
|---------|--------|--------|
| Architecture | Monolithic | Serverless |
| Server File | `dist/server/index.js` | `api/index.js` |
| Process | Long-running | Per-request |
| Startup | Once on deploy | Cold start per function |
| Static Files | Served by Express | Served by Vercel CDN |

## Troubleshooting

### Blank White Screen

**Possible Causes**:
1. Build failed - Check Vercel build logs
2. Environment variables missing - Verify in Vercel dashboard
3. API routes not working - Check serverless function logs
4. CORS issues - Verify CORS configuration

**Solutions**:
1. Check browser console for errors
2. Verify `/api/health` endpoint works
3. Check Vercel function logs
4. Ensure all environment variables are set

### API Routes Not Working

1. **Check Function Logs**:
   - Go to Vercel Dashboard → Deployments → Your Deployment → Functions
   - Click on `api/index.js` to see logs

2. **Verify Build Output**:
   - Ensure `dist/server/routes` exists after build
   - Check that routes are compiled correctly

3. **Test Locally**:
   ```bash
   npm run build
   vercel dev
   ```

### Cold Start Issues

Serverless functions have cold starts (first request after idle):
- First request may be slow (1-3 seconds)
- Subsequent requests are fast
- Consider using Vercel's Edge Functions for faster cold starts

## Testing Deployment

### 1. Health Check
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

### 2. Frontend
Visit `https://your-app.vercel.app` in browser
- Should load the login page
- No console errors
- Assets loading correctly

### 3. Authentication
Try logging in:
- Should make request to `/api/auth/login`
- Should receive token
- Should redirect to dashboard

## Maintaining Both Deployments

### Render Configuration
- Keep `railway.json` (works for Render too)
- Uses `npm start` → runs `dist/server/index.js`
- Monolithic architecture

### Vercel Configuration
- Uses `vercel.json`
- Uses `api/index.js` serverless wrapper
- Serverless architecture

### Code Changes
The codebase supports both:
- `src/server/index.ts` exports the Express app
- Checks `process.env.VERCEL` to skip server startup in serverless
- Both use the same compiled routes from `dist/server/routes`

## Performance Optimization

### For Vercel

1. **Enable Edge Caching**:
   - Static assets automatically cached
   - Configure cache headers for API responses

2. **Optimize Bundle Size**:
   - Keep dependencies minimal
   - Use tree-shaking
   - Lazy load routes

3. **Database Connection Pooling**:
   - Supabase handles this automatically
   - No need for connection pooling in serverless

## Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard
- Track page views, performance
- Monitor function execution time

### Error Tracking
- Check Vercel function logs
- Set up error reporting (Sentry, etc.)
- Monitor API response times

## Cost Considerations

### Vercel Free Tier
- 100GB bandwidth/month
- Unlimited serverless function executions
- 100GB-hours function execution time
- Good for development and small projects

### Vercel Pro ($20/month)
- 1TB bandwidth
- Unlimited function executions
- More function execution time
- Better for production

## Rollback

If deployment fails:
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "Promote to Production"
4. Instant rollback

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

## Next Steps

1. Deploy to Vercel
2. Test all functionality
3. Set up custom domain (optional)
4. Enable analytics
5. Monitor performance
6. Keep Render deployment as backup

---

**Note**: Both Render and Vercel deployments can run simultaneously. Use Render for production and Vercel for staging, or vice versa.
