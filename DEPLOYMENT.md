# UrbanGate - Installation & Deployment Guide

## 📋 Prerequisites

- Node.js 14+ (https://nodejs.org/)
- MongoDB 4.4+ (https://www.mongodb.com/try/download/community)
- npm or yarn package manager
- Git (for version control)
- Postman (optional, for API testing)

## 🔧 Local Development Setup

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB connection string and JWT secret
nano .env

# Ensure MongoDB is running (separate terminal)
# macOS/Linux:
mongod

# Windows:
# Start MongoDB service from Services

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Frontend runs on http://localhost:3000
```

### Verify Setup

1. Open http://localhost:3000 in browser
2. You should see the UrbanGate login page
3. Use demo credentials to login:
   - Email: resident@example.com
   - Password: password123

## 🌐 Environment Configuration

### Backend .env

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/urbangate
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/urbangate?retryWrites=true

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend Setup

1. Update `src/utils/api.js` if backend is on different URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

2. Or create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## 🚀 Production Deployment

### Option 1: Deploy to Heroku (Backend)

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku

   # Windows/Linux
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create urbangate-api
   ```

4. **Add MongoDB Atlas**
   ```bash
   heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/urbangate
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your_production_secret
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://urbangate-app.vercel.app
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Deploy to Vercel (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment**
   - In Vercel dashboard, set: `VITE_API_URL=https://urbangate-api.herokuapp.com/api`

4. **Redeploy if needed**
   ```bash
   vercel --prod
   ```

### Option 3: Deploy with Docker

**Create `backend/Dockerfile`**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Create `frontend/Dockerfile`**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

**Create `docker-compose.yml`**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/urbangate
      JWT_SECRET: your_secret_key
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      VITE_API_URL: http://backend:5000/api
    depends_on:
      - backend

volumes:
  mongo_data:
```

**Run with Docker**
```bash
docker-compose up
```

## 📊 Database Setup

### MongoDB Local

```bash
# Start MongoDB service
mongod

# In another terminal, connect to MongoDB shell
mongosh

# Your database will be created automatically
```

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Whitelist IP address
5. Copy connection string
6. Replace `MONGODB_URI` in `.env`

```
mongodb+srv://username:password@cluster0.xxxxxx.mongodb.net/urbangate?retryWrites=true&w=majority
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use MongoDB Atlas instead of local for production
- [ ] Enable HTTPS for production
- [ ] Configure CORS properly in production
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on APIs
- [ ] Add request validation
- [ ] Set secure headers
- [ ] Configure firewall rules
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords
- [ ] Implement CSRF protection

## 📈 Performance Optimization

### Backend
- Add pagination to all list endpoints
- Implement caching with Redis (optional)
- Use database indexes
- Compress responses with gzip

### Frontend
- Build for production: `npm run build`
- Use React lazy loading
- Minimize bundle size
- Enable asset compression
- Use CDN for static files

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm install --save-dev jest supertest
npm test
```

### Frontend Testing
```bash
cd frontend
npm install --save-dev vitest @testing-library/react
npm test
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running and connection string is correct
# Check MongoDB status
systemctl status mongod
# Restart if needed
systemctl restart mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
kill -9 <PID>

# Or change PORT in .env
```

### CORS Error
```
Solution: Update FRONTEND_URL in backend .env
CORS is configured in server.js
Check if frontend URL matches
```

### Cannot Connect to API
```
Solution: Verify backend is running
npm run dev in backend directory
Check if MONGODB_URI is correct
Check network connectivity
```

## 📝 Useful Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm start            # Production server
npm test             # Run tests
```

### Frontend
```bash
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

### MongoDB
```bash
mongosh              # Connect to MongoDB
show databases       # List databases
use urbangate        # Switch to urbangate db
show collections     # List collections
db.users.find()      # View all users
```

## 🚀 Monitoring & Logs

### Backend Logs
```bash
# Development (see console output)
npm run dev

# Production (save to file)
npm start > logs.txt 2>&1 &
```

### Frontend Error Tracking
- Browser DevTools Console (F12)
- Network tab for API calls
- Application tab for localStorage

### Database Monitoring
- MongoDB Atlas dashboard
- Local MongoDB Compass GUI

## 💾 Backup & Recovery

### Backup MongoDB
```bash
# Export database
mongodump --uri="mongodb://localhost:27017/urbangate" --out=./backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/urbangate" ./backup
```

## 📞 Support Resources

- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Complete Documentation: `COMPLETE_DOCUMENTATION.md`
- Quick Start: `QUICKSTART.md`

---

**Deployment successful! 🎉**
