# Vercel Build Fix

## Issue
Vercel build was failing with error:
```
[vite]: Rollup failed to resolve import "/src/client/index.tsx" from "/vercel/path0/index.html"
```

## Root Cause
The `index.html` file was using an absolute path `/src/client/index.tsx` which doesn't resolve correctly in Vercel's build environment (`/vercel/path0/`).

## Solution
Changed the script src in `index.html` from absolute to relative path:

### Before
```html
<script type="module" src="/src/client/index.tsx"></script>
```

### After
```html
<script type="module" src="./src/client/index.tsx"></script>
```

## Files Modified
1. **index.html** - Changed script src to relative path
2. **vercel.json** - Simplified configuration
3. **vite.config.ts** - Added explicit root and emptyOutDir

## Verification
Build tested locally and works:
```bash
npm run build:client
✓ built in 7.45s
```

## Vercel Configuration
Final `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Next Steps
1. Commit changes
2. Push to GitHub
3. Vercel will auto-deploy
4. Build should succeed

## Status
✅ Fixed and ready to deploy
