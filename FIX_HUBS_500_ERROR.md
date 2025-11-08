# Fix Hubs 500 Error

## Problem
The `/api/v1/hubs` endpoint is returning a 500 Internal Server Error because the `hubs` table doesn't exist in the database.

## Solution

A migration file has been created at:
`backend/prisma/migrations/20251106000000_add_hubs_tables/migration.sql`

### Option 1: Apply Migration via Prisma (Recommended)

When your database is available and not locked, run:

```bash
cd backend
npx prisma migrate deploy
```

Or if you're in development:

```bash
cd backend
npx prisma migrate dev
```

### Option 2: Apply Migration Manually via SQL

If Prisma commands are timing out due to database locks, you can apply the migration directly:

1. Connect to your PostgreSQL database:
```bash
psql -h localhost -p 5433 -U your_username -d physician_dashboard_2035
```

2. Run the SQL from the migration file:
```sql
-- Copy and paste the contents of:
-- backend/prisma/migrations/20251106000000_add_hubs_tables/migration.sql
```

3. Mark the migration as applied in Prisma:
```bash
cd backend
npx prisma migrate resolve --applied 20251106000000_add_hubs_tables
```

### Option 3: Check Database Connection

If you're getting timeout errors, check:

1. **Is PostgreSQL running?**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -h localhost -p 5433
   ```

2. **Are there other connections holding locks?**
   - Check for other Prisma processes
   - Check for other database connections
   - Restart PostgreSQL if needed

3. **Database connection settings:**
   - Verify `DATABASE_URL` in `backend/.env`
   - Ensure the database server is accessible

### After Migration is Applied

Once the migration is applied:

1. **Regenerate Prisma Client:**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Seed the hubs (if not already done):**
   ```bash
   cd backend
   npm run seed:hubs
   ```

3. **Restart the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Test the API:**
   - The frontend should now be able to load hubs
   - Check browser console for successful API calls

## Verification

After applying the migration, verify the tables exist:

```bash
cd backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.hub.findMany().then(hubs => { console.log('✅ Hubs table exists! Found', hubs.length, 'hubs'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

If this succeeds, the tables are created and the API should work.

