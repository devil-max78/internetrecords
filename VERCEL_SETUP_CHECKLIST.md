# Vercel Deployment Checklist

## Pre-Deployment

- [ ] Project builds successfully locally
  ```bash
  npm run build
  ```

- [ ] All tests pass (if applicable)
  ```bash
  npm test
  ```

- [ ] Environment variables documented
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] JWT_SECRET

- [ ] Code committed to Git
  ```bash
  git add .
  git commit -m "Add Vercel configuration"
  git push
  ```

## Vercel Configuration

- [ ] `vercel.json` file created
- [ ] `api/index.js` serverless wrapper created
- [ ] `.vercelignore` file created
- [ ] `package.json` has `vercel-build` script
- [ ] `src/server/index.ts` exports app for serverless

## Vercel Dashboard Setup

- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Configure project settings:
  - [ ] Framework Preset: Other
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist/client`
  - [ ] Install Command: `npm install`

## Environment Variables

Add in Vercel Dashboard → Settings → Environment Variables:

- [ ] `SUPABASE_URL` = `your_supabase_project_url`
- [ ] `SUPABASE_ANON_KEY` = `your_supabase_anon_key`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `your_supabase_service_role_key`
- [ ] `JWT_SECRET` = `your_jwt_secret_key`
- [ ] `NODE_ENV` = `production`

## First Deployment

- [ ] Click "Deploy" in Vercel dashboard
- [ ] Wait for build to complete (~2-5 minutes)
- [ ] Check deployment logs for errors
- [ ] Note deployment URL (e.g., `your-app.vercel.app`)

## Post-Deployment Testing

### 1. Health Check
- [ ] Visit `https://your-app.vercel.app/api/health`
- [ ] Should return: `{"status":"ok","message":"Vercel serverless function running"}`

### 2. Frontend
- [ ] Visit `https://your-app.vercel.app`
- [ ] Page loads without blank screen
- [ ] No console errors in browser DevTools
- [ ] Logo and branding display correctly

### 3. Authentication
- [ ] Navigate to login page
- [ ] Try logging in with test credentials
- [ ] Should redirect to dashboard on success
- [ ] Token stored in localStorage

### 4. API Endpoints
Test key endpoints:
- [ ] `GET /api/metadata/sub-labels`
- [ ] `GET /api/metadata/publishers`
- [ ] `GET /api/releases` (requires auth)
- [ ] `POST /api/auth/login`

### 5. File Upload
- [ ] Try uploading artwork
- [ ] Try uploading audio file (MP3)
- [ ] Files should upload to Supabase Storage

## Troubleshooting

### If Blank White Screen:

1. **Check Browser Console**
   - [ ] Open DevTools (F12)
   - [ ] Look for JavaScript errors
   - [ ] Check Network tab for failed requests

2. **Check Vercel Function Logs**
   - [ ] Go to Vercel Dashboard → Deployments
   - [ ] Click on your deployment
   - [ ] Click "Functions" tab
   - [ ] Check `api/index.js` logs

3. **Verify Build Output**
   - [ ] Check build logs in Vercel
   - [ ] Ensure `dist/client` was created
   - [ ] Ensure `dist/server` was created

4. **Check Environment Variables**
   - [ ] All variables set in Vercel dashboard
   - [ ] No typos in variable names
   - [ ] Values are correct

### If API Not Working:

1. **Test Health Endpoint**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Check CORS**
   - [ ] CORS enabled in `api/index.js`
   - [ ] Origin allowed for your domain

3. **Check Database Connection**
   - [ ] Supabase credentials correct
   - [ ] Database accessible from Vercel
   - [ ] RLS policies configured

4. **Check Function Timeout**
   - [ ] Requests complete within 10 seconds (Hobby plan)
   - [ ] Consider upgrading if needed

## Custom Domain (Optional)

- [ ] Go to Vercel Dashboard → Settings → Domains
- [ ] Add custom domain
- [ ] Update DNS records as instructed
- [ ] Wait for DNS propagation (~24 hours)
- [ ] SSL certificate auto-generated

## Monitoring

- [ ] Enable Vercel Analytics
  - [ ] Go to Analytics tab
  - [ ] Enable Web Analytics
  - [ ] Monitor page views and performance

- [ ] Set up error tracking (optional)
  - [ ] Integrate Sentry or similar
  - [ ] Monitor function errors
  - [ ] Set up alerts

## Performance Optimization

- [ ] Enable Edge Caching
  - [ ] Add cache headers to API responses
  - [ ] Configure in `vercel.json`

- [ ] Optimize bundle size
  - [ ] Check bundle analyzer
  - [ ] Remove unused dependencies
  - [ ] Lazy load routes

- [ ] Monitor function execution time
  - [ ] Check Vercel function logs
  - [ ] Optimize slow endpoints
  - [ ] Consider caching strategies

## Continuous Deployment

- [ ] Automatic deployments enabled
  - [ ] Push to main branch → Production
  - [ ] Push to other branches → Preview
  - [ ] Pull requests → Preview URLs

- [ ] Configure deployment settings
  - [ ] Auto-deploy on push: Enabled
  - [ ] Preview deployments: Enabled
  - [ ] Production branch: main

## Rollback Plan

If deployment fails:
- [ ] Go to Vercel Dashboard → Deployments
- [ ] Find previous working deployment
- [ ] Click "Promote to Production"
- [ ] Verify rollback successful

## Maintenance

### Regular Tasks
- [ ] Monitor function logs weekly
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Update dependencies monthly

### Before Major Updates
- [ ] Test in preview deployment first
- [ ] Verify all features work
- [ ] Check performance impact
- [ ] Have rollback plan ready

## Success Criteria

Deployment is successful when:
- ✅ Frontend loads without blank screen
- ✅ Login/authentication works
- ✅ API endpoints respond correctly
- ✅ File uploads work
- ✅ No console errors
- ✅ Performance acceptable (<3s page load)
- ✅ All features functional

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status Page**: [vercel-status.com](https://vercel-status.com)

## Notes

- First deployment may take longer (5-10 minutes)
- Subsequent deployments faster (2-3 minutes)
- Preview deployments for PRs are automatic
- Free tier has 100GB bandwidth/month
- Upgrade to Pro if needed ($20/month)

---

**Checklist Complete?** 
If all items checked and tests pass, your Vercel deployment is ready! 🎉

**Keep Render Running?**
Yes! Use Render for production and Vercel for staging/preview.
