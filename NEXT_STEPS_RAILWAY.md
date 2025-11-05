# Next Steps: Deploy to Railway

## Step 1: Go to Railway Dashboard

1. Open https://railway.app
2. Sign in to your account
3. Click on your project "2035"

## Step 2: Check Your Backend Service

1. Look for your backend service in the project
2. Click on it to open the service dashboard

## Step 3: Verify Root Directory (CRITICAL)

1. Click on the **Settings** tab (⚙️ gear icon)
2. Look for **"Root Directory"** or **"Source"** section
3. It should say: `backend`
   - If it's empty or says `.` or `/`, change it to: `backend`
   - If you don't see this option, proceed to Step 4

## Step 4: Add PostgreSQL Database (if not already added)

1. In your Railway project, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway will automatically create the database
4. Note: The `DATABASE_URL` will be automatically available

## Step 5: Set Environment Variables

1. Go to your backend service
2. Click on the **Variables** tab
3. Add these required variables:

**Click "New Variable" and add each:**

| Variable Name | Value |
|--------------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `PORT` | `3000` |
| `JWT_SECRET` | *(generate with command below)* |
| `JWT_REFRESH_SECRET` | *(generate with command below)* |

**Generate JWT secrets:**
Open your terminal and run:
```bash
openssl rand -base64 32
# Copy the output and paste as JWT_SECRET value

openssl rand -base64 32
# Copy the output and paste as JWT_REFRESH_SECRET value
```

**Optional variables:**
- `CORS_ORIGIN` - Your frontend URL (e.g., `https://yourdomain.com`)

## Step 6: Deploy

Railway should automatically detect your GitHub push and start deploying. If not:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Watch the build logs

## Step 7: Monitor Build Logs

Watch the build process. You should see:

✅ **Success indicators:**
- Building from `backend/` directory
- `FROM node:18-alpine` (not nginx)
- Installing backend packages (express, prisma, etc.)
- Copying `docker-entrypoint.sh` successfully
- Running database migrations
- Server starting on port 3000

❌ **If you see errors:**
- Share the error message and I'll help fix it

## Step 8: Test Your API

Once deployment succeeds, Railway will give you a URL like:
`https://your-service.railway.app`

Test it:

```bash
# Health check
curl https://your-service.railway.app/health

# API info
curl https://your-service.railway.app/api/v1
```

## Quick Summary

1. ✅ Go to Railway dashboard
2. ✅ Check Root Directory is set to `backend`
3. ✅ Add PostgreSQL database (if needed)
4. ✅ Set environment variables (especially JWT secrets)
5. ✅ Deploy (auto or manual)
6. ✅ Test your API

## Need Help?

If you encounter any issues:
- Share the error message from build logs
- Check if Root Directory is set correctly
- Verify all environment variables are set
- Make sure PostgreSQL database is running

---

**You're almost there!** Once deployed, your backend API will be live on Railway! 🚀

