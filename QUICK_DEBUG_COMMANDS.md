# Quick Debug Commands

## Browser Console Commands

Once the app is loaded, open browser console (F12) and use:

```javascript
// Check authentication state
window.__DEBUG__.debugAuthState()

// Check environment variables
window.__DEBUG__.debugEnv()

// Check localStorage
localStorage.getItem('authToken')
localStorage.getItem('refreshToken')

// Clear auth (for testing)
localStorage.removeItem('authToken')
localStorage.removeItem('refreshToken')
location.reload()
```

## Terminal Commands

### Check Server Status
```bash
# Backend health
curl http://localhost:3000/health

# Frontend status
curl -I http://localhost:5173

# Check ports
lsof -ti:3000  # Backend
lsof -ti:5173  # Frontend
```

### Test API Endpoints
```bash
# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'

# Test patients (need token from login above)
TOKEN="your-token-here"
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer $TOKEN"
```

### Database Commands
```bash
# Open Prisma Studio (visual DB viewer)
cd backend && npm run prisma:studio

# Query users directly
cd backend
psql $DATABASE_URL -c "SELECT email, role, \"isActive\" FROM \"User\";"

# Seed database
cd backend && npm run prisma:seed
```

### Start Servers
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
npm run dev
```

### View Logs
```bash
# Backend logs are in the terminal running npm run dev
# Frontend logs are in browser console (F12)
```

## VS Code Debugging

1. Press `F5` or go to Run → Start Debugging
2. Select configuration:
   - "Launch Chrome against localhost" - Debug frontend
   - "Debug Backend" - Debug backend server
   - "Launch Full Stack" - Debug both

3. Set breakpoints in code by clicking left of line numbers
4. Step through code with F10 (step over) and F11 (step into)

## Common Debug Scenarios

### Issue: Can't Login
```javascript
// In browser console:
window.__DEBUG__.debugAuthState()
window.__DEBUG__.debugEnv()
// Check Network tab for failed requests
```

### Issue: API Calls Failing
```javascript
// In browser console:
// Check Network tab in DevTools
// Look for failed requests (red)
// Click on failed request to see details
```

### Issue: Data Not Loading
```javascript
// In browser console:
localStorage.getItem('authToken')  // Should have token
// Check React DevTools → Components tab
// Inspect component state and props
```

### Issue: Backend Not Responding
```bash
# In terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok"}
# If not, check backend is running
cd backend && npm run dev
```

