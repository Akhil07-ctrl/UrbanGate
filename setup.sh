#!/bin/bash

# UrbanGate - Setup Script
# Run this script to set up the entire project

echo "🏢 UrbanGate - Apartment Management System"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js is installed$(node --version)${NC}"

# Check if MongoDB is accessible
if ! command -v mongosh &> /dev/null && ! command -v mongo &> /dev/null; then
    echo -e "${BLUE}ℹ️ MongoDB client not found. Make sure MongoDB is running separately.${NC}"
    echo "   You can use MongoDB Atlas (cloud) or local MongoDB installation."
fi

echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please update it with your settings.${NC}"
fi

# Install dependencies
echo "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..

echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "==========================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Make sure MongoDB is running:"
echo "   - Local: mongod"
echo "   - Or use MongoDB Atlas (update MONGODB_URI in backend/.env)"
echo ""
echo "2. Start the Backend (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start the Frontend (Terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "5. Login with demo credentials:"
echo "   Email: resident@example.com"
echo "   Password: password123"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICKSTART.md"
echo "   - Full Docs: COMPLETE_DOCUMENTATION.md"
echo "   - Deployment: DEPLOYMENT.md"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
