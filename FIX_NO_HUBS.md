# Fix: "No hubs found" Issue

## Problem
The Hubs page shows "No hubs found" because the database doesn't have the hubs table or the hubs haven't been seeded yet.

## Solution

### Step 1: Run Database Migrations

The hubs table needs to be created first:

```bash
cd backend
npx prisma migrate dev
```

This will:
- Create the `hubs` table (and related tables)
- Apply all pending migrations

### Step 2: Seed Hubs

After migrations, seed the hubs:

**Option A: Run seed script (Recommended)**
```bash
cd backend
npm run seed:hubs
```

**Option B: Run full seed**
```bash
cd backend
npm run prisma:seed
```

**Option C: Restart backend (Auto-seed)**
The backend will automatically create hubs on startup if they don't exist. Just restart:
```bash
cd backend
npm run dev
```

### Step 3: Verify

1. Check backend logs - you should see:
   ```
   🏥 No hubs found, auto-seeding default hubs...
   ✅ Auto-seeded 10 hubs
   ```

2. Refresh the Hubs page in the app
3. You should now see all 10 hubs

## Quick Fix (If Database is Running)

If your database is already running and migrated:

```bash
cd backend
npm run seed:hubs
```

Then refresh the Hubs page.

## Troubleshooting

### "Database tables do not exist"
Run migrations first:
```bash
cd backend
npx prisma migrate dev
```

### "Database connection timeout"
1. Make sure PostgreSQL is running
2. Check your `.env` file has correct `DATABASE_URL`
3. Test connection: `npx prisma db pull`

### "Still seeing No hubs found"
1. Check browser console for API errors
2. Check backend logs for errors
3. Verify API endpoint works: `curl http://localhost:3000/api/v1/hubs` (with auth token)
4. Make sure backend is running: `npm run dev` in backend directory

## What Was Implemented

✅ Auto-seed on backend startup (checks and creates hubs if missing)
✅ Seed script that can be run manually
✅ Hubs included in full seed script
✅ Docker entrypoint seeds hubs after migrations

The hubs will be created automatically once the database is properly migrated!

