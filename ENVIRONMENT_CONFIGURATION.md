# UrbanGate - Complete Environment Setup Guide

## 🎯 Overview

This guide covers environment configuration for both frontend and backend of the UrbanGate application.

## 📁 Environment Files Summary

### Frontend (`frontend/`)

| File | Purpose | Committed | Auto-generated |
|------|---------|-----------|-----------------|
| `.env.local` | Development config | ❌ NO | ✅ YES (first time) |
| `.env.production` | Production template | ✅ YES | ❌ NO |
| `.env.example` | Documentation | ✅ YES | ❌ NO |
| `ENV_SETUP.md` | Detailed guide | ✅ YES | ❌ NO |

### Backend (`backend/`)

| File | Purpose | Committed | Auto-generated |
|------|---------|-----------|-----------------|
| `.env` | Development config | ❌ NO | ❌ NO |
| `.env.example` | Documentation | ✅ YES | ❌ NO |
| `BACKEND_ENV.md` | Setup guide | ✅ YES | ❌ NO |

## 🚀 First Time Setup

### Frontend Setup
```bash
cd frontend

# File .env.local is already created with defaults:
# VITE_API_URL=http://localhost:5000
# VITE_API_BASE_PATH=/api

# If you need to change backend URL, edit .env.local
# nano .env.local  # Mac/Linux
# notepad .env.local  # Windows

npm install
npm run dev
```

### Backend Setup
```bash
cd backend

# Copy example file
cp .env.example .env

# Edit .env with your settings
# nano .env  # Mac/Linux
# notepad .env  # Windows

npm install
npm run dev
```

## ⚙️ Environment Variables

### Frontend Environment Variables (`.env.local`)

```env
# Backend API URL (must match backend PORT)
VITE_API_URL=http://localhost:5000

# API path
VITE_API_BASE_PATH=/api
```

**Used in:**
- `src/utils/api.js` - HTTP client configuration
- `src/hooks/useSocket.js` - Socket.io connection

### Backend Environment Variables (`.env`)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/urbangate

# Security
JWT_SECRET=your_secret_key_here

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🔄 Typical Development Workflow

```
1. Terminal 1 - Backend
   ├── cd backend
   ├── npm run dev
   └── Listening on http://localhost:5000

2. Terminal 2 - Frontend
   ├── cd frontend
   ├── npm run dev
   └── Listening on http://localhost:3002 (or 3000)

3. Browser
   └── Open http://localhost:3002
       └── Frontend connects to http://localhost:5000
           └── Both servers working together ✅
```

## 🌍 Environment Configurations

### Local Development (Default)
```env
# Frontend (.env.local)
VITE_API_URL=http://localhost:5000
VITE_API_BASE_PATH=/api

# Backend (.env)
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Remote Development Server
```env
# Frontend (.env.local)
VITE_API_URL=http://192.168.1.100:5000
VITE_API_BASE_PATH=/api

# Backend (.env)
PORT=5000
FRONTEND_URL=http://192.168.1.100:3000
```

### Docker Development
```env
# Frontend (.env.local)
VITE_API_URL=http://backend:5000
VITE_API_BASE_PATH=/api

# Backend (.env)
PORT=5000
MONGODB_URI=mongodb://mongo:27017/urbangate
FRONTEND_URL=http://localhost:3000
```

### Production
```env
# Frontend (.env.production)
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_PATH=/api

# Backend (.env)
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/urbangate
JWT_SECRET=strong_secret_key_here
FRONTEND_URL=https://yourdomain.com
```

## 🔐 Security Best Practices

### ✅ DO's
- ✅ Keep `.env.local` out of Git (it's in .gitignore)
- ✅ Use strong `JWT_SECRET` in production
- ✅ Update `FRONTEND_URL` for CORS security
- ✅ Use HTTPS URLs in production
- ✅ Store secrets in environment, not code

### ❌ DON'Ts
- ❌ Commit `.env` or `.env.local` to Git
- ❌ Use same secret in dev and prod
- ❌ Expose API URLs in public code
- ❌ Share `.env` files via email/chat
- ❌ Use `localhost` URLs in production

## 🧪 Verification Steps

### 1. Check Frontend Configuration
```bash
cd frontend
# Look for these files
ls -la | grep env
# Should see: .env.local, .env.example, .env.production
```

### 2. Check Backend Configuration
```bash
cd backend
# Look for these files
ls -la | grep env
# Should see: .env, .env.example
```

### 3. Verify Backend Connection (Browser Console)
```javascript
// Frontend is running
console.log(import.meta.env.VITE_API_URL);
// Should print: http://localhost:5000

// Test API connection
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
// Should print: { message: 'Server is running' }
```

### 4. Verify Backend is Accessible
```bash
# Terminal
curl http://localhost:5000/api/health

# Should return: {"message":"Server is running"}
```

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: "Failed to fetch" errors

**Solutions**:
```bash
# 1. Check backend is running
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# 2. Check VITE_API_URL matches
cat frontend/.env.local
# Should show: VITE_API_URL=http://localhost:5000

# 3. Restart frontend after .env.local changes
npm run dev

# 4. Check backend CORS settings
# In backend, FRONTEND_URL should match frontend URL
cat backend/.env
```

### Socket.io Not Connecting

**Problem**: Real-time notifications not working

**Solutions**:
- Ensure `VITE_API_URL` matches backend address
- Check backend Socket.io is initialized
- Verify no firewall blocking the connection

### Environment Variables Not Loading

**Problem**: `import.meta.env.VITE_*` is undefined

**Solutions**:
```bash
# 1. Variables must start with VITE_
# ❌ Wrong: MY_API_URL
# ✅ Correct: VITE_API_URL

# 2. Restart dev server
npm run dev

# 3. Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📚 Documentation Files

- **Frontend**: `frontend/ENV_SETUP.md` - Detailed frontend setup
- **Backend**: `backend/BACKEND_ENV.md` - Backend configuration
- **Summary**: `ENVIRONMENT_SETUP_SUMMARY.md` - Quick reference
- **This File**: `ENVIRONMENT_CONFIGURATION.md` - Complete guide

## 🎓 Common Tasks

### Change Backend URL
```bash
# Edit frontend/.env.local
VITE_API_URL=http://new-backend-url:5000

# Restart frontend
npm run dev
```

### Add New Environment Variable

**Frontend**:
1. Add to `.env.local`: `VITE_MY_VAR=value`
2. Access in code: `import.meta.env.VITE_MY_VAR`

**Backend**:
1. Add to `.env`: `MY_VAR=value`
2. Access in code: `process.env.MY_VAR`

### Deploy to Production

**Frontend**:
```bash
# Update .env.production with production URL
npm run build
# Deploy dist/ folder
```

**Backend**:
```bash
# Update .env with production settings
# Deploy application
npm run build
```

## ✅ Checklist

Before deploying:

- [ ] Backend `.env` is created with production values
- [ ] Frontend `.env.local` is NOT committed (check .gitignore)
- [ ] Frontend `.env.production` has production URLs
- [ ] Backend and Frontend URLs match
- [ ] JWT_SECRET is strong and unique
- [ ] CORS FRONTEND_URL is correct
- [ ] Database connection string is valid
- [ ] All team members have `.env.local` set up
- [ ] Documentation files are updated

## 📞 Support

For specific issues, refer to:
- Frontend: `frontend/ENV_SETUP.md`
- Backend: `backend/BACKEND_ENV.md`
- General: This file

---

**Last Updated**: November 27, 2025
**Status**: ✅ Complete and Ready
