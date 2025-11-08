# Backend Status Check

## ✅ Backend Should Be Running

I've restarted the backend. Check if it's working:

```bash
# Check if backend is responding
curl http://localhost:3000/health

# Should return: {"status":"ok",...}
```

---

## 🔍 If Still Not Working

### Check What's Using Port 3000:
```bash
lsof -i :3000
```

### Restart Backend Manually:
```bash
cd backend
npm run dev
```

### Check Backend Logs:
The backend logs are in `/tmp/backend-start.log`

---

## 🚀 Quick Restart Command

```bash
cd "/Users/lacbis/ 2035/backend"
pkill -f "nodemon" || true
pkill -f "ts-node.*app.ts" || true
npm run dev
```

---

## 📋 Verify Everything

1. **Database running?**
   ```bash
   docker-compose ps
   ```

2. **Backend responding?**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Frontend can reach it?**
   - Open browser console
   - Check network tab
   - Look for requests to `localhost:3000`

---

## ⚠️ Common Issues

**Port 3000 in use?**
- Kill the process: `kill -9 $(lsof -ti:3000)`

**Database not connected?**
- Start database: `docker-compose up -d postgres redis`

**Backend crashed?**
- Check logs: `tail -f /tmp/backend-start.log`
- Fix any errors shown

