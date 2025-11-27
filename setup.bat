@echo off
REM UrbanGate - Setup Script for Windows
REM Run this script to set up the entire project

echo.
echo 🏢 UrbanGate - Apartment Management System
echo ===========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js is installed %NODE_VERSION%

echo.
echo Setting up Backend...
cd backend

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ✅ .env file created. Please update it with your settings.
)

REM Install dependencies
echo Installing backend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)
echo ✅ Backend dependencies installed

cd ..

echo.
echo Setting up Frontend...
cd frontend

REM Install dependencies
echo Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)
echo ✅ Frontend dependencies installed

cd ..

echo.
echo ===========================================
echo ✅ Setup Complete!
echo ===========================================
echo.
echo 📝 Next Steps:
echo.
echo 1. Make sure MongoDB is running:
echo    - Local: mongod
echo    - Or use MongoDB Atlas (update MONGODB_URI in backend\.env)
echo.
echo 2. Start the Backend (Terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start the Frontend (Terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open your browser:
echo    http://localhost:3000
echo.
echo 5. Login with demo credentials:
echo    Email: resident@example.com
echo    Password: password123
echo.
echo 📚 Documentation:
echo    - Quick Start: QUICKSTART.md
echo    - Full Docs: COMPLETE_DOCUMENTATION.md
echo    - Deployment: DEPLOYMENT.md
echo.
echo Happy coding! 🚀
echo.
pause
