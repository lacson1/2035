# User Registration Guide

## ⚠️ Demo Accounts Removed

**Test/demo accounts have been removed.** The application now requires all users to create real accounts through the registration process.

## How to Create Accounts

### For New Users

1. Navigate to the login page
2. Click "Don't have an account? Sign up"
3. Fill in the registration form:
   - First Name (required)
   - Last Name (required)
   - Email (required)
   - Password (required, minimum 8 characters)
   - Username (optional - will be generated from email if not provided)
4. Click "Sign Up"
5. You'll be automatically logged in after successful registration

### Default Role Assignment

- **First user** (first person to register) is automatically assigned the `admin` role
- **Subsequent users** are assigned the `read_only` role by default

The `read_only` role has limited permissions:
- Can view patient data
- Can view medications, appointments, notes, etc.
- Cannot create, edit, or delete data

The `admin` role has full permissions:
- Can manage users (create, edit, delete, change roles)
- Can access all patient data
- Can create, edit, and delete all records
- Can manage system settings

### Role Management

Administrators can:
- View all users in the User Management interface
- Change user roles
- Activate/deactivate user accounts
- Update user permissions

To become an administrator or change a user's role:
1. Log in as an existing administrator
2. Navigate to User Management
3. Select the user
4. Update their role and permissions

## Database Seeding

The seed script (`backend/prisma/seed.ts`) no longer creates test users. It only creates sample patient data if users already exist in the database.

To seed the database:
```bash
cd backend
npm run prisma:seed
```

**Note:** If no users exist, the seed script will skip sample data creation. Users must register first.

## First-Time Setup

If this is a fresh installation:

1. **Run migrations:**
   ```bash
   cd backend
   npm run prisma:migrate dev
   ```

2. **Create your first account:**
   - Start the frontend: `npm run dev` (from project root)
   - Navigate to the login page
   - Click "Sign up" and create an account

3. **Optional - Seed sample data:**
   ```bash
   cd backend
   npm run prisma:seed
   ```
   (This will create sample patient data if users exist)

4. **Promote to Admin (if needed):**
   - Use Prisma Studio or a database tool
   - Update the user's role to `admin` in the `users` table
   - Or use the User Management interface if you have admin access

## Verification

To verify users exist in the database:

### Option 1: Using Prisma Studio
```bash
cd backend
npm run prisma:studio
```
Navigate to the `User` table to see all registered users.

### Option 2: Using psql
```bash
psql $DATABASE_URL
SELECT email, username, role, "isActive" FROM users;
```

## Security Notes

- All passwords are hashed using bcrypt (12 salt rounds)
- Email addresses must be unique
- Usernames must be unique
- All authentication events are logged in the audit log
- Sessions are stored in the database for token revocation
