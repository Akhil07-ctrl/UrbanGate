# UrbanGate Frontend Environment Configuration

## Overview
The frontend uses Vite's environment variable system to configure the backend API URL and other settings. All environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

## Environment Files

### `.env.local` (Development - Local Machine)
- **Purpose**: Local development configuration
- **When to use**: On your development machine
- **Status**: NOT committed to Git (in .gitignore)
- **Default values**:
  ```
  VITE_API_URL=http://localhost:5000
  VITE_API_BASE_PATH=/api
  ```

### `.env.production` (Production Build)
- **Purpose**: Production deployment configuration
- **When to use**: When building for production deployment
- **Status**: CAN be committed to Git (template)
- **Default values**: Update with your production server URL

### `.env.example` (Template)
- **Purpose**: Documentation and template for environment variables
- **When to use**: Reference for what variables are available
- **Status**: Committed to Git (for team reference)

## Environment Variables

### `VITE_API_URL`
- **Type**: String (URL)
- **Default**: `http://localhost:5000`
- **Description**: Base URL of the UrbanGate backend API server
- **Example values**:
  - Development: `http://localhost:5000`
  - Production: `https://api.example.com`
  - Docker: `http://backend:5000`

### `VITE_API_BASE_PATH`
- **Type**: String (Path)
- **Default**: `/api`
- **Description**: Base path for API endpoints
- **Example values**: `/api`, `/api/v1`

## How It Works

### In Development
1. Create a `.env.local` file in the `frontend` directory
2. Add your local configuration:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_API_BASE_PATH=/api
   ```
3. Run `npm run dev`
4. Vite automatically loads variables from `.env.local`

### In Production
1. Update `.env.production` with your production URLs
2. Run `npm run build`
3. Vite uses variables from `.env.production`

### Code Usage
The environment variables are accessed using `import.meta.env`:

```javascript
// In api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api';

// In hooks/useSocket.js
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Setup Instructions

### First Time Setup
```bash
cd frontend

# Copy the example file
cp .env.example .env.local

# Edit with your local configuration
# On Windows:
notepad .env.local
# On Mac/Linux:
nano .env.local

# Start development server
npm run dev
```

### Switching Environments

**For Local Development:**
```bash
# .env.local
VITE_API_URL=http://localhost:5000
```

**For Docker/Container Development:**
```bash
# .env.local
VITE_API_URL=http://backend:5000
```

**For Remote Development Server:**
```bash
# .env.local
VITE_API_URL=http://192.168.1.100:5000
```

**For Production:**
Update `.env.production` and build:
```bash
npm run build
```

## Git Workflow

### What's Committed
✅ `.env.example` - Template file for team reference
✅ `.env.production` - Production template (without secrets)

### What's NOT Committed
❌ `.env.local` - Your personal development configuration
❌ Any `.env` files with sensitive data

### Team Collaboration
1. `.env.example` documents all available variables
2. Each developer creates their own `.env.local`
3. New variables are added to `.env.example` first
4. Team members update their `.env.local` accordingly

## Troubleshooting

### Backend Connection Issues
**Problem**: "Failed to fetch" or connection refused errors

**Solution**:
1. Verify backend is running on the correct port
   ```bash
   netstat -ano | findstr :5000  # Windows
   lsof -i :5000                 # Mac/Linux
   ```

2. Check `VITE_API_URL` matches backend address
   ```javascript
   console.log(import.meta.env.VITE_API_URL);
   ```

3. Ensure backend has CORS enabled for your frontend URL

### Socket.io Connection Issues
**Problem**: "Socket disconnected" or failed to connect

**Solution**:
- `VITE_API_URL` must match the backend socket.io server URL
- Check backend CORS configuration includes your frontend URL

### Environment Variables Not Loading
**Problem**: Variables show as `undefined`

**Solution**:
1. Ensure variable names start with `VITE_`
2. Restart dev server after changing `.env.local`
3. Check file exists in correct location (`frontend/.env.local`)

## Production Deployment

### Before Building
```bash
# Update .env.production with production URLs
VITE_API_URL=https://api.yourdomain.com
VITE_API_BASE_PATH=/api
```

### Build Command
```bash
npm run build
```

### Deploy
The built files in `dist/` will use the production environment variables.

### Important Notes
- Build-time variables are baked into the final bundle
- Cannot change environment variables after build without rebuilding
- For truly dynamic configuration, use API calls at runtime

## References
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [VITE_ Prefix Documentation](https://vitejs.dev/guide/env-and-mode.html#env-variables)
