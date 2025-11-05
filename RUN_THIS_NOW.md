# Run These Commands Now

## Step 1: Login to Railway

Run this command in your terminal:

```bash
cd "/Users/lacbis/ 2035"
npx @railway/cli login
```

This will open your browser to authenticate. Complete the login.

## Step 2: Link to Your Project

```bash
npx @railway/cli link
```

Select your project "2035" when prompted.

## Step 3: List Services

```bash
npx @railway/cli service list
```

Note the name of your backend service.

## Step 4: Set Root Directory

Replace `your-service-name` with the actual service name from Step 3:

```bash
npx @railway/cli variables set RAILWAY_ROOT_DIRECTORY=backend
```

Or try:

```bash
npx @railway/cli service --set-root-directory backend
```

## Step 5: Trigger Redeploy

Go back to Railway dashboard:
1. Go to your service
2. Click **Deployments** tab
3. Click **Redeploy**

## Alternative: If CLI Doesn't Work

**Delete and recreate the service:**

1. In Railway → Your service → Settings → Danger Zone → Delete Service
2. Click **+ New** → **GitHub Repo**
3. Choose your repository
4. **During setup**, look for root directory option
5. Set to `backend`
6. Complete setup

---

**Quick Option:** The easiest solution is to delete the current service and create a new one. Railway will prompt for root directory during creation.

