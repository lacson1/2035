# Deploy to Vercel - Quick Start

## Step 1: Push to GitHub (Already Done ✅)

Your code is now on GitHub at: `lacson1/2035`

## Step 2: Connect to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Select your repository: `lacson1/2035`
5. Vercel will auto-detect Vite configuration

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd "/Users/lacbis/ 2035"
vercel
```

## Step 3: Configure Project Settings

Vercel should auto-detect:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `.` (root)

### Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```env
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
```

Or if using your local backend:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

## Step 5: Update API URL (Important!)

After deployment:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   ```
3. Redeploy to apply changes

## Auto-Deployments

Vercel automatically deploys when you push to:
- `main` branch → Production
- Other branches → Preview deployments

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify `npm run build` works locally
- Check for TypeScript errors

### API Connection Issues
- Set `VITE_API_BASE_URL` environment variable
- Ensure backend CORS allows your Vercel domain
- Check backend is running and accessible

### 404 Errors on Routes
- `vercel.json` should handle SPA routing (already configured)
- Verify rewrites are set up correctly

---

**Your `vercel.json` is already configured! Just connect to Vercel and deploy.** 🚀

