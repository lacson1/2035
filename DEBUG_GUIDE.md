# Debug Guide for Physician Dashboard 2035

## Quick Debug Checklist

### 1. Verify Servers Are Running

```bash
# Check backend (port 3000)
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Check frontend (port 5173)
curl http://localhost:5173
# Should return HTML

# Check if ports are in use
lsof -ti:3000  # Backend
lsof -ti:5173  # Frontend
```

### 2. Check Browser Console

Open DevTools (F12) and check:
- **Console Tab**: Look for errors (red), warnings (yellow)
- **Network Tab**: Check API requests (status codes, responses)
- **React DevTools**: Inspect component tree and state

### 3. Common Issues & Solutions

#### Backend Not Running
```bash
cd backend
npm run dev
```

#### Frontend Not Running
```bash
npm run dev
```

#### CORS Errors
- Check `backend/.env`: `CORS_ORIGIN=http://localhost:5173`
- Restart backend after changing `.env`

#### 401 Unauthorized
- Check if token exists: `localStorage.getItem('authToken')`
- Try logging in again
- Check token expiration

#### 404 Route Not Found
- Verify API endpoint path matches backend routes
- Check `VITE_API_BASE_URL` in frontend `.env`

#### Database Connection Issues
```bash
cd backend
npm run prisma:studio  # Visual database viewer
psql $DATABASE_URL -c "SELECT 1;"  # Test connection
```

### 4. Debugging Tools

#### React DevTools
- Install browser extension for component inspection
- View component props, state, and hooks
- Profile performance

#### Browser DevTools
- **Console**: Check errors and warnings
- **Network**: Monitor API calls
- **Application**: Check localStorage, sessionStorage
- **Sources**: Set breakpoints and debug

#### VS Code Debugging
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### 5. Logging & Debug Output

#### Frontend Logging
- Check `src/services/api.ts` for network error logs
- Check `src/context/AuthContext.tsx` for auth logs
- All console logs are gated with `import.meta.env.DEV`

#### Backend Logging
- Check backend terminal for server logs
- Look for error stack traces
- Check database query logs

### 6. Testing Endpoints

#### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

#### Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

#### Test Patients API (with token)
```bash
TOKEN="your-token-here"
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Environment Variables

#### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Backend `.env`
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
CORS_ORIGIN=http://localhost:5173
PORT=3000
```

### 8. Database Debugging

#### Check if users exist
```bash
cd backend
npm run prisma:studio
# Or via psql:
psql $DATABASE_URL -c "SELECT email, role FROM \"User\";"
```

#### Seed database if needed
```bash
cd backend
npm run prisma:seed
```

### 9. Component Debugging

#### Check Component State
- Use React DevTools to inspect component state
- Check props being passed
- Verify hooks are working correctly

#### Common Component Issues
- Missing dependencies in useEffect
- State not updating properly
- Props not being passed correctly
- Context not providing values

### 10. Network Debugging

#### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Click on failed requests (red)
4. Check:
   - Request URL
   - Request headers
   - Response status
   - Response body

#### Common Network Issues
- **CORS errors**: Check backend CORS configuration
- **404 errors**: Verify endpoint paths
- **401 errors**: Check authentication token
- **500 errors**: Check backend logs

### 11. Performance Debugging

#### React Profiler
- Use React DevTools Profiler tab
- Record a performance profile
- Identify slow components
- Check render times

#### Network Performance
- Check request timing in Network tab
- Look for slow API calls
- Check bundle size

### 12. Error Boundary Debugging

The app has Error Boundaries in place:
- Top-level in `main.tsx`
- Component-level where needed

Check Error Boundary logs for:
- Component errors
- Error stack traces
- Error recovery options

## Quick Debug Commands

```bash
# Check both servers
lsof -ti:3000 && echo "✅ Backend running" || echo "❌ Backend not running"
lsof -ti:5173 && echo "✅ Frontend running" || echo "❌ Frontend not running"

# Test backend health
curl -s http://localhost:3000/health | jq .

# Check database connection
cd backend && psql $DATABASE_URL -c "SELECT 1;" && echo "✅ DB connected"

# View backend logs
cd backend && npm run dev

# View frontend logs
npm run dev
```

## Debugging Checklist

- [ ] Both servers running (backend:3000, frontend:5173)
- [ ] No console errors in browser
- [ ] API endpoints responding correctly
- [ ] Authentication working
- [ ] Database connection established
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] React DevTools installed
- [ ] Network requests successful
- [ ] Data loading correctly

