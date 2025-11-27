# Backend Environment Configuration

## Overview
The backend uses `.env` file for configuration management using the `dotenv` package.

## Environment Variables

### Required Variables

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `PORT` | Number | `5000` | Server port |
| `MONGODB_URI` | String | `mongodb://localhost:27017/urbangate` | MongoDB connection string |
| `JWT_SECRET` | String | `your_jwt_secret_key_here` | JWT signing secret |
| `NODE_ENV` | String | `development` | Environment (development/production) |
| `FRONTEND_URL` | String | `http://localhost:3000` | Frontend URL for CORS |

## Files

### `.env` (Local Development)
- Contains local development configuration
- **NOT** committed to Git (in .gitignore)
- Created during initial setup

### `.env.example` (Template)
- Template showing all available variables
- **IS** committed to Git
- For team reference

## Quick Start

```bash
cd backend

# Copy example file
cp .env.example .env

# Edit with your local configuration
# Windows: notepad .env
# Mac/Linux: nano .env

# Install dependencies and start
npm install
npm run dev
```

## Configuration by Environment

### Development (Local)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urbangate
JWT_SECRET=dev_secret_key_12345
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Production
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/urbangate
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## Connection from Frontend

The frontend will connect to `http://localhost:5000` (or configured `VITE_API_URL`) by default.

Ensure backend `PORT` and frontend `VITE_API_URL` match:
- Backend: `PORT=5000`
- Frontend: `VITE_API_URL=http://localhost:5000`
