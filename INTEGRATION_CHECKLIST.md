# Frontend-Backend Integration Checklist

## ✅ Pre-Integration Checklist

### Backend Setup
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Database created and configured
- [ ] `.env` file configured with DATABASE_URL
- [ ] Prisma migrations run (`npm run prisma:migrate`)
- [ ] Database seeded (`npm run prisma:seed`)
- [ ] Backend server starts successfully (`npm run dev`)
- [ ] Health endpoint works: `http://localhost:3000/health`
- [ ] Login endpoint tested successfully

### Frontend Setup
- [ ] Frontend dependencies installed
- [ ] `.env` file created with `VITE_API_BASE_URL=http://localhost:3000/api`
- [ ] API client updated (already done ✅)
- [ ] Verify API client has token refresh logic (already done ✅)

## 🔄 Integration Steps

### Step 1: Environment Configuration

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Backend `.env`:**
```env
CORS_ORIGIN=http://localhost:5173
```

### Step 2: Test Backend Connection

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Test health endpoint
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

### Step 3: Create Auth Context (if not exists)

Create `src/context/AuthContext.tsx` following `FRONTEND_BACKEND_INTEGRATION.md`

### Step 4: Update Patient Service

The existing `src/services/patients.ts` should work with the backend API!

### Step 5: Test Integration

1. Start both servers:
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

2. Test login flow
3. Test patient list loading
4. Test patient details
5. Test CRUD operations

## 🧪 Testing Checklist

### Authentication
- [ ] Login works
- [ ] Token stored in localStorage
- [ ] Refresh token works
- [ ] Logout clears tokens
- [ ] Protected routes redirect to login

### Patients
- [ ] Patient list loads from API
- [ ] Patient search works
- [ ] Patient details load
- [ ] Create patient works
- [ ] Update patient works
- [ ] Delete patient works
- [ ] Pagination works
- [ ] Filters work

### Medications
- [ ] List medications for patient
- [ ] Create medication
- [ ] Update medication
- [ ] Delete medication

### Appointments
- [ ] List appointments for patient
- [ ] Create appointment
- [ ] Update appointment
- [ ] Delete appointment

### Clinical Notes
- [ ] List notes for patient
- [ ] Create note
- [ ] Update note
- [ ] Delete note

### Imaging Studies
- [ ] List imaging studies for patient
- [ ] Create imaging study
- [ ] Update imaging study
- [ ] Delete imaging study

### Care Team
- [ ] List care team members
- [ ] Add member
- [ ] Update member
- [ ] Remove member

## 🐛 Common Issues & Solutions

### CORS Errors
**Problem:** Frontend can't connect to backend
**Solution:** 
- Check `CORS_ORIGIN` in backend `.env`
- Ensure it matches frontend URL (http://localhost:5173)

### 401 Unauthorized
**Problem:** Token expired or invalid
**Solution:**
- Check token refresh logic
- Verify token is being sent in headers
- Check token expiration time

### 404 Not Found
**Problem:** Endpoint doesn't exist
**Solution:**
- Verify API base URL is correct
- Check endpoint path matches backend routes
- Ensure backend server is running

### Database Connection Errors
**Problem:** Backend can't connect to database
**Solution:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in backend `.env`
- Test connection: `psql $DATABASE_URL`

## 📊 Integration Status

### Completed ✅
- [x] Backend API fully implemented
- [x] Frontend API client ready
- [x] Token refresh logic added
- [x] Response format handling

### In Progress 🔄
- [ ] Auth context creation
- [ ] Service integration
- [ ] Component updates

### Pending 📝
- [ ] Full end-to-end testing
- [ ] Error handling updates
- [ ] Loading state updates
- [ ] Remove mock data

## 🚀 Quick Start Integration

```bash
# 1. Start database (if using Docker)
cd backend
docker-compose up -d postgres

# 2. Start backend
cd backend
npm run dev

# 3. Start frontend (in new terminal)
npm run dev

# 4. Test in browser
# Open http://localhost:5173
# Login with: sarah.johnson@hospital2035.com / password123
```

## 📚 Documentation References

- `FRONTEND_BACKEND_INTEGRATION.md` - Detailed integration guide
- `BACKEND_READY.md` - Backend setup guide
- `API_ENDPOINTS.md` - Complete API documentation
- `backend/SETUP_INSTRUCTIONS.md` - Backend setup

---

**Status:** Ready for integration! 🎉

