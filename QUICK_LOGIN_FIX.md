# 🚀 Quick Login Fix Guide

## Issue: "Invalid email or password"

If you're still getting this error after the case-insensitive fix, follow these steps:

---

## Step 1: Check if Your Account Exists

Run the diagnostic tool to verify your email is in the database:

```bash
cd backend
npx tsx scripts/check-user-account.ts
```

Enter your email when prompted. This will show:
- ✅ If your account exists
- 📧 The exact email stored in database
- 👤 Account details (name, role, active status)
- 📋 List of all registered users

---

## Step 2: Verify Account Status

The diagnostic tool will show if your account is:
- ✅ **Active** - Account is enabled
- ❌ **Inactive** - Account is disabled (contact admin)

---

## Step 3: Reset Password (If Needed)

If your account exists but password doesn't work, reset it:

### Option A: Interactive Reset
```bash
cd backend
npx tsx scripts/reset-user-password.ts
```
Enter your email and new password when prompted.

### Option B: Command Line Reset
```bash
cd backend
npx tsx scripts/reset-user-password.ts your-email@example.com YourNewPassword123!
```

**Password Requirements:**
- At least 8 characters
- Contains uppercase letter
- Contains lowercase letter
- Contains number
- Contains special character

---

## Step 4: Restart Backend (If Changes Not Applied)

The backend might need a restart to pick up the case-insensitive changes:

```bash
# Stop the backend (Ctrl+C if running)
# Then restart:
cd backend
npm run dev
```

---

## Step 5: Test Login

Try logging in again with:
- Your email (any case variation should work now)
- Your password (or the new password if you reset it)

---

## Common Issues & Solutions

### Issue 1: "User not found"
**Solution:**
- Run `npx tsx scripts/check-user-account.ts` to see all registered users
- Verify you're using the correct email
- Check if you registered with a different email

### Issue 2: "Account is inactive"
**Solution:**
- Contact administrator to activate your account
- Or use the diagnostic tool to check status

### Issue 3: "Invalid email or password" (after reset)
**Solution:**
- Make sure backend is restarted
- Check password requirements are met
- Try the exact email from database (shown in diagnostic tool)

### Issue 4: Backend not running
**Solution:**
```bash
cd backend
npm run dev
```

Check it's running:
```bash
curl http://localhost:3000/health
```

---

## Quick Commands Reference

```bash
# Check if account exists
cd backend && npx tsx scripts/check-user-account.ts

# Reset password
cd backend && npx tsx scripts/reset-user-password.ts

# Restart backend
cd backend && npm run dev

# Check backend health
curl http://localhost:3000/health
```

---

## Still Having Issues?

1. **Check backend logs** for specific error messages
2. **Verify database connection** is working
3. **Check if email exists** using diagnostic tool
4. **Try password reset** if account exists
5. **Contact administrator** if account is inactive

---

**Last Updated:** November 2025

