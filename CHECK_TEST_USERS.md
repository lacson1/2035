# Checking Test Users in Database

## Test Users Created by Seed Script

The seed script (`backend/prisma/seed.ts`) creates **3 test users**:

### 1. Admin User
- **Email:** `admin@hospital2035.com`
- **Password:** `admin123`
- **Role:** Admin
- **Department:** IT

### 2. Physician User
- **Email:** `sarah.johnson@hospital2035.com`
- **Password:** `password123`
- **Role:** Physician
- **Specialty:** Internal Medicine

### 3. Nurse User
- **Email:** `patricia.williams@hospital2035.com`
- **Password:** `password123`
- **Role:** Nurse
- **Department:** Nursing

## How to Seed the Database

If the users don't exist yet, run the seed command:

```bash
cd backend
npm run prisma:seed
```

Or if using the full migration:

```bash
cd backend
npm run prisma:migrate reset  # WARNING: This deletes all data and recreates
# OR
npm run prisma:migrate dev    # Run migrations
npm run prisma:seed           # Seed data
```

## Verify Users Exist in Database

### Option 1: Using Prisma Studio (Visual)
```bash
cd backend
npm run prisma:studio
```
Then navigate to the `User` table to see all users.

### Option 2: Using psql (Command Line)
```bash
# Connect to database
psql $DATABASE_URL

# Query users
SELECT email, username, role, "isActive" FROM "User";

# Should see:
# admin@hospital2035.com | admin | admin | true
# sarah.johnson@hospital2035.com | sarah.johnson | physician | true
# patricia.williams@hospital2035.com | patricia.williams | nurse | true
```

### Option 3: Test Login Endpoint
```bash
# Test Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital2035.com","password":"admin123"}'

# Test Physician
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'

# Test Nurse
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patricia.williams@hospital2035.com","password":"password123"}'
```

## Seed Script Details

The seed script uses `upsert` which means:
- **If user exists:** It will NOT update (empty update object)
- **If user doesn't exist:** It will create the user

This is safe to run multiple times - it won't create duplicates.

## Troubleshooting

### Users Not Found After Seed
1. Check database connection: `psql $DATABASE_URL -c "SELECT 1;"`
2. Verify migrations ran: `npm run prisma:migrate status`
3. Check seed script executed: Look for "✅ Created users" in console output
4. Verify DATABASE_URL in `.env` is correct

### Password Not Working
- Passwords are hashed with bcrypt (12 rounds)
- Seed script uses: `hashPassword('admin123')` and `hashPassword('password123')`
- If you manually created users, ensure passwords are hashed correctly

### User Exists But Login Fails
- Check `isActive` field is `true`
- Verify email matches exactly (case-sensitive)
- Check backend logs for authentication errors

