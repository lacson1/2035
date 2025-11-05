# Render Environment Variables - Copy & Paste

## Generated Secrets (Ready to Use)

Copy these values into Render:

### JWT_SECRET
```
YOUR_JWT_SECRET_HERE
```

### JWT_REFRESH_SECRET
```
YOUR_JWT_REFRESH_SECRET_HERE
```

## Complete Environment Variables for Render

Copy and paste these into Render Dashboard → Your Backend Service → Environment:

### Required Variables:

```env
NODE_ENV=production
DATABASE_URL=<paste from PostgreSQL database - Internal Database URL>
PORT=3000
JWT_SECRET=<paste generated secret above>
JWT_REFRESH_SECRET=<paste generated secret above>
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Step-by-Step in Render

1. **Go to Render Dashboard**
2. **Click your backend service**
3. **Go to "Environment" tab**
4. **Click "Add Environment Variable"** for each:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `<from PostgreSQL service>` |
   | `PORT` | `3000` |
   | `JWT_SECRET` | `<generated secret>` |
   | `JWT_REFRESH_SECRET` | `<generated secret>` |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` |

5. **Save Changes**
6. **Redeploy** (Manual Deploy → Deploy latest commit)

---

**Note**: Replace placeholders with actual values!

