# 🚀 Backend Start Guide

## ✅ Backend Should Be Running Now

I've restarted the backend server. It should be running on **http://localhost:3000**

---

## 🔍 Verify Backend is Running

```bash
# Check health endpoint
curl http://localhost:3000/health

# Should return: {"status":"ok",...}
```

---

## 📋 Login Credentials

- **Email**: `test@admin.com`
- **Password**: `Test123!@#`

---

## 🐛 If Backend Still Not Working

### Option 1: Manual Start

```bash
cd backend
npm run dev
```

Keep this terminal open - backend runs in foreground.

### Option 2: Check Logs

```bash
# View backend logs
tail -f /tmp/backend.log
```

### Option 3: Check Database

```bash
cd backend
docker-compose ps

# Should show postgres and redis running
```

---

## ✅ Quick Checklist

- [ ] Database running: `docker-compose ps`
- [ ] Backend responding: `curl http://localhost:3000/health`
- [ ] Frontend can reach backend (check browser console)

---

## 🚀 Try Login Now

1. **Refresh your browser** (hard refresh: Cmd+Shift+R)
2. **Enter credentials**:
   - Email: `test@admin.com`
   - Password: `Test123!@#`
3. **Click Login**

---

## 📝 Backend Logs Location

Backend logs are saved to: `/tmp/backend.log`

View them with:
```bash
tail -f /tmp/backend.log
```

