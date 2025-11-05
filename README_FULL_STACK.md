# 🏥 Physician Dashboard 2035 - Full Stack

A modern, full-stack healthcare dashboard application built with React, TypeScript, Node.js, and PostgreSQL.

## 🎯 Quick Start

### Option 1: Automated Startup (Easiest)

```bash
# Start both servers with one command
./start.sh
```

### Option 2: Manual Setup

**1. Start Database:**
```bash
cd backend
docker-compose up -d postgres
```

**2. Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

**3. Setup Frontend:**
```bash
# In project root
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env
npm install
npm run dev
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Detailed setup guide
- **[INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)** - Integration steps
- **[FINAL_STATUS.md](./FINAL_STATUS.md)** - Complete status
- **[BACKEND_READY.md](./BACKEND_READY.md)** - Backend status
- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - API documentation

## 🏗️ Architecture

### Backend
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (access + refresh tokens)
- **Port:** 3000

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Port:** 5173

## 🔐 Default Credentials

After seeding:
- **Admin:** admin@hospital2035.com / admin123
- **Physician:** sarah.johnson@hospital2035.com / password123
- **Nurse:** patricia.williams@hospital2035.com / password123

## ✨ Features

### Backend
- ✅ 30+ REST API endpoints
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Patient management
- ✅ Medication tracking
- ✅ Appointment scheduling
- ✅ Clinical notes
- ✅ Imaging studies
- ✅ Care team management

### Frontend
- ✅ Modern, responsive UI
- ✅ Dark mode support
- ✅ Patient dashboard
- ✅ Real-time data loading
- ✅ Authentication system
- ✅ Protected routes
- ✅ Error handling

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:3000/health
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sarah.johnson@hospital2035.com","password":"password123"}'
```

### Frontend
1. Open http://localhost:5173
2. Login with test credentials
3. Explore patient dashboard

## 📁 Project Structure

```
.
├── backend/              # Backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth, errors
│   ├── prisma/           # Database schema
│   └── docker-compose.yml
├── src/                  # Frontend
│   ├── components/       # React components
│   ├── context/          # State management
│   ├── services/         # API clients
│   └── pages/            # Page components
└── docs/                 # Documentation
```

## 🔧 Development

### Backend Commands
```bash
cd backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run prisma:studio # Database GUI
npm test             # Run tests
```

### Frontend Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in backend `.env`
- Test: `psql $DATABASE_URL`

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `http://localhost:5173`

### Port Already in Use
- Change `PORT` in backend `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

## 📊 API Endpoints

See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete documentation.

**Key Endpoints:**
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/patients` - List patients
- `GET /api/v1/patients/:id` - Get patient
- `POST /api/v1/patients` - Create patient
- And 25+ more endpoints...

## 🚀 Deployment

### Backend
1. Set production environment variables
2. Run migrations: `npm run prisma:migrate`
3. Build: `npm run build`
4. Start: `npm start`

### Frontend
1. Set `VITE_API_BASE_URL` to production API
2. Build: `npm run build`
3. Deploy `dist/` folder

## 📝 License

ISC

## 🎉 Status

**✅ FULLY FUNCTIONAL**

- Backend: Complete with 30+ endpoints
- Frontend: Complete with authentication
- Integration: Ready for use
- Documentation: Comprehensive

**Start developing:** Follow `QUICK_START.md`!

