# Troubleshooting "Failed to Fetch" Errors

## Common Causes

### 1. Backend Server Not Running
**Symptom:** `Failed to fetch` or `Network error` in console

**Solution:**
```bash
# Check if backend is running
cd backend
npm run dev

# Should see: "Server running on port 3000"
```

### 2. CORS Configuration Issue
**Symptom:** CORS error in browser console

**Solution:**
- Check backend `.env` file has:
  ```env
  CORS_ORIGIN=http://localhost:5173
  ```
- Restart backend server after changing `.env`
- Verify backend CORS middleware is enabled

### 3. Incorrect API Base URL
**Symptom:** Requests going to wrong URL

**Solution:**
- Check frontend `.env` file:
  ```env
  VITE_API_BASE_URL=http://localhost:3000/api
  ```
- Restart frontend dev server after changing `.env`
- Verify URL in browser Network tab matches expected

### 4. Port Conflicts
**Symptom:** "Port already in use" or connection refused

**Solution:**
```bash
# Check what's using port 3000
lsof -ti:3000

# Kill process if needed
lsof -ti:3000 | xargs kill

# Or change port in backend .env
PORT=3001
```

### 5. Network/Firewall Issues
**Symptom:** Timeout or connection refused

**Solution:**
- Check firewall settings
- Verify localhost is accessible
- Try `curl http://localhost:3000/health` to test backend

## Quick Diagnostic Steps

1. **Verify Backend is Running:**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"ok"}
   ```

2. **Test Login Endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Check Browser Console:**
   - Open DevTools → Network tab
   - Look for failed requests (red)
   - Check request URL and error message

4. **Verify Environment Variables:**
   ```bash
   # Frontend
   echo $VITE_API_BASE_URL
   
   # Backend
   echo $CORS_ORIGIN
   ```

## Error Messages Reference

### Status 0 (Network Error)
- **Meaning:** Request never reached server
- **Causes:** Server down, CORS, wrong URL, network issue
- **Fix:** Check backend is running, verify CORS config

### Status 401 (Unauthorized)
- **Meaning:** Token expired or invalid
- **Fix:** Login again, check token refresh logic

### Status 404 (Not Found)
- **Meaning:** Endpoint doesn't exist
- **Fix:** Verify API endpoint path matches backend routes

### Status 500 (Server Error)
- **Meaning:** Backend error
- **Fix:** Check backend logs, database connection

## Development Setup Checklist

- [ ] Backend dependencies installed (`npm install` in `backend/`)
- [ ] Backend `.env` configured with `CORS_ORIGIN=http://localhost:5173`
- [ ] Backend server running (`npm run dev` in `backend/`)
- [ ] Frontend `.env` has `VITE_API_BASE_URL=http://localhost:3000/api`
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Health endpoint works: `http://localhost:3000/health`
- [ ] No CORS errors in browser console

## Still Having Issues?

1. Check browser console for detailed error messages
2. Verify both servers are running in separate terminals
3. Check Network tab in DevTools for request/response details
4. Review backend logs for server-side errors
5. Ensure no ad blockers or browser extensions are interfering

