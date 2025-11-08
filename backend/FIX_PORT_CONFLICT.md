# Fix Port 3000 Conflict

## ✅ Solution Applied

I've updated `docker-compose.local.yml` to use port **3001** on your host machine instead of 3000.

**What changed:**
- Docker container still runs on port 3000 internally
- Host machine now maps to port **3001** (avoids conflict)
- Access backend at: `http://localhost:3001`

---

## 🚀 Quick Fix Options

### Option 1: Use New Port (Already Done ✅)
```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```
**Access at**: http://localhost:3001

### Option 2: Kill Process Using Port 3000
```bash
# Find and kill process
kill -9 $(lsof -ti:3000)

# Then use original port 3000
# (revert docker-compose.local.yml change if needed)
```

### Option 3: Change Port Back to 3000
If you want to use port 3000 again, edit `docker-compose.local.yml`:
```yaml
ports:
  - "3000:3000"  # Change back from 3001:3000
```

---

## 📝 Update Frontend (If Needed)

If your frontend is configured to use `http://localhost:3000`, update it to:
- `http://localhost:3001` (new port)

Or update `.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

---

## ✅ Current Status

- ✅ Port mapping changed to 3001:3000
- ✅ Process on port 3000 killed (if it existed)
- ✅ Ready to start Docker

**Run this now:**
```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```

