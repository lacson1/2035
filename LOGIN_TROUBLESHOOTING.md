# 🔐 Login Troubleshooting Guide

## Issue: Unable to Login with Registered Email

### ✅ **FIXED: Case-Sensitive Email Issue**

The login system has been updated to handle email case-insensitivity. Here's what was fixed:

---

## 🔧 Changes Made

### 1. **Case-Insensitive Email Lookup**

**Before:**
- Email lookup was case-sensitive
- If you registered with `User@Example.com` but tried to login with `user@example.com`, it would fail

**After:**
- Email lookup is now case-insensitive
- Emails are normalized (trimmed and converted to lowercase) before lookup
- All new registrations store email in lowercase format

### 2. **Better Error Messages**

- If email exists with different case, suggests the correct email
- More helpful error messages for debugging

### 3. **Email Normalization**

- Trims whitespace from email addresses
- Converts to lowercase for consistency
- Prevents duplicate registrations with different cases

---

## 🛠️ Diagnostic Tools

### Check User Account

Run this script to check if your email exists in the database:

```bash
cd backend
npx tsx scripts/check-user-account.ts
```

This will:
- Check if your email exists (case-sensitive and case-insensitive)
- Show account details if found
- List similar emails if exact match not found
- Show all registered users

---

## 🔍 Common Issues & Solutions

### Issue 1: "Invalid email or password"

**Possible Causes:**
1. Email case mismatch (now fixed)
2. Wrong password
3. Account is inactive
4. Email not registered

**Solutions:**
1. ✅ **Case sensitivity is now fixed** - try logging in again
2. Check if you're using the correct password
3. Check if account is active (contact admin)
4. Verify email is registered using diagnostic tool

### Issue 2: Account Inactive

**Error:** "Account is inactive"

**Solution:**
- Contact administrator to activate your account
- Or use the diagnostic tool to check account status

### Issue 3: Email Not Found

**Error:** "Invalid email or password"

**Check:**
1. Run diagnostic tool: `npx tsx scripts/check-user-account.ts`
2. Verify email spelling
3. Check if you registered with a different email

---

## 🧪 Testing Login

### Test with Different Email Cases

The system now accepts:
- `user@example.com`
- `User@Example.com`
- `USER@EXAMPLE.COM`
- `  user@example.com  ` (whitespace trimmed)

All will match the same account.

---

## 📝 Registration Changes

### New Registrations

- Emails are automatically normalized (lowercase) when stored
- Prevents duplicate accounts with different cases
- More consistent database

### Existing Users

- Can login with any case variation of their email
- System will find them case-insensitively
- No need to re-register

---

## 🔄 Migration for Existing Users

If you have existing users with mixed-case emails:

1. **Option 1: Login works** (recommended)
   - Users can login with any case
   - System finds them case-insensitively
   - No changes needed

2. **Option 2: Normalize existing emails** (optional)
   ```sql
   -- Run this SQL to normalize all emails to lowercase
   UPDATE users SET email = LOWER(email);
   ```

---

## 🚀 Quick Fix Steps

1. **Try logging in again** - case sensitivity is now fixed
2. **If still failing:**
   - Run diagnostic tool: `cd backend && npx tsx scripts/check-user-account.ts`
   - Check the exact email in database
   - Verify password is correct
   - Check if account is active

3. **Reset password if needed:**
   - Use "Forgot Password" link on login page
   - Or contact administrator

---

## 📊 Backend Changes

### Files Modified:

1. **`backend/src/services/auth.service.ts`**
   - Login: Case-insensitive email lookup
   - Register: Normalize email to lowercase
   - Better error messages

2. **`backend/src/controllers/auth.controller.ts`**
   - Trim email whitespace before processing
   - Normalize input data

3. **`backend/scripts/check-user-account.ts`** (NEW)
   - Diagnostic tool to check user accounts
   - Shows account details and status

---

## ✅ Verification

After the fix, you should be able to:
- ✅ Login with any case variation of your email
- ✅ See helpful error messages if email doesn't exist
- ✅ Register without case-sensitivity issues
- ✅ Use diagnostic tool to check account status

---

## 🆘 Still Having Issues?

1. **Check backend logs:**
   ```bash
   cd backend
   npm run dev
   # Look for error messages in console
   ```

2. **Test API directly:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your-email@example.com","password":"your-password"}'
   ```

3. **Check database:**
   ```bash
   cd backend
   npx tsx scripts/check-user-account.ts
   ```

4. **Verify:
   - Backend server is running
   - Database is connected
   - Email exists in database
   - Password is correct
   - Account is active

---

**Last Updated:** November 2025  
**Status:** ✅ Fixed - Case-insensitive login now working

