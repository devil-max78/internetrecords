# Deployment Guide - Vercel

## Prerequisites
- GitHub account
- Vercel account (free) - https://vercel.com
- Your Supabase credentials

## Step-by-Step Deployment

### 1. Prepare Your Code

First, make sure your `.gitignore` includes:
```
node_modules/
dist/
.env
.env.local
*.log
```

### 2. Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Music Distribution Platform"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect the settings

### 4. Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables

Add these variables:

```
NODE_ENV=production
SUPABASE_URL=https://spxvjfkojezlcowhwjzv.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret_here
ADMIN_INITIAL_EMAIL=admin@example.com
ADMIN_INITIAL_PASSWORD=your_secure_password
SUPABASE_STORAGE_BUCKET=music-files
```

**Important:** Get your keys from:
- Supabase Dashboard → Settings → API
- Copy from your local `.env` file

### 5. Deploy

Click "Deploy" and Vercel will:
- Build your frontend
- Deploy your backend
- Give you a live URL (e.g., `your-app.vercel.app`)

### 6. Update Supabase Settings

After deployment, update your Supabase project:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add to "Redirect URLs": `https://your-app.vercel.app/*`

### 7. Test Your Deployment

1. Visit your Vercel URL
2. Try logging in
3. Test uploading a release
4. Verify admin functions work

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally: `npm run build`

### API Not Working
- Check environment variables are set correctly
- Verify Supabase keys are correct
- Check Vercel function logs

### CORS Errors
- Update Supabase CORS settings
- Add your Vercel domain to allowed origins

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase URLs accordingly

## Monitoring

- **Logs**: Vercel Dashboard → Your Project → Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Performance**: Vercel Dashboard → Your Project → Speed Insights

## Updating Your App

After making changes:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically redeploy!

## Cost

- **Free Tier Includes:**
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless functions
  - Automatic HTTPS
  - Global CDN

- **Upgrade if you need:**
  - More bandwidth
  - More function execution time
  - Team collaboration features

## Alternative: Railway

If you prefer Railway (also great for full-stack):

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Deploy!

Railway gives you:
- $5 free credit/month
- Persistent storage
- Database hosting
- Easy scaling

## Support

If you encounter issues:
1. Check Vercel logs
2. Check Supabase logs
3. Verify environment variables
4. Test locally first: `npm run dev`

Your app should now be live and accessible worldwide! 🚀
