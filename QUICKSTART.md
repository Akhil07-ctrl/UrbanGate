# UrbanGate - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend will run at: http://localhost:5000

### Step 2: Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:3000

### Step 3: Login

Use demo credentials:
- **Email**: resident@example.com
- **Password**: password123

---

## 📱 Features Overview

### For Residents
- 📝 **Complaints**: Raise and track complaints
- 📢 **Announcements**: Receive updates
- 👤 **Visitor Pass**: Generate QR codes for guests
- 🚗 **Parking**: View slots and request guest parking
- 🏋️ **Facilities**: Book clubhouse, gym, etc.
- 💰 **Payments**: View and pay maintenance dues
- 🗳️ **Polls**: Vote in community decisions

### For Admin
- ✅ **Manage Complaints**: Assign and track
- 📣 **Create Announcements**: Post to community
- 🅿️ **Manage Parking**: Approve/reject requests
- 🏛️ **Manage Facilities**: Create and manage bookings
- 💳 **Manage Payments**: Create invoices
- 📊 **Create Polls**: Post community votes

### For Security
- 🔍 **Scan QR Code**: Check in/out visitors
- 📋 **View Announcements**: Important notices

---

## 🎨 Design Highlights

✨ **Clean & Professional**
- White and grey color scheme
- Subtle shadows and spacing
- Professional typography

📱 **Fully Responsive**
- Works on mobile, tablet, desktop
- Touch-friendly interface
- Adaptive layouts

⚡ **Real-time Updates**
- Socket.io integration
- Instant notifications
- Live announcements

---

## 🛠️ Technology Stack

**Backend**: Node.js, Express, MongoDB, Socket.io
**Frontend**: React, Tailwind CSS, Vite, Socket.io
**Database**: MongoDB
**Authentication**: JWT

---

## 📝 Project Structure

```
UrbanGate/
├── backend/          # Express API server
│   ├── models/       # MongoDB schemas
│   ├── controllers/  # Business logic
│   ├── routes/       # API endpoints
│   └── server.js     # Entry point
│
└── frontend/         # React web app
    ├── src/
    │   ├── pages/    # Feature pages
    │   ├── components/  # UI components
    │   ├── context/  # Global state
    │   └── utils/    # Helpers
    └── index.html    # Entry point
```

---

## 🔐 Security Features

✅ JWT-based authentication
✅ Password hashing with bcrypt
✅ Role-based access control
✅ Protected API endpoints
✅ CORS enabled

---

## 📊 API Summary

| Feature | Endpoints | Auth Required |
|---------|-----------|--------------|
| Auth | /api/auth | ✓ (Some) |
| Complaints | /api/complaints | ✓ |
| Announcements | /api/announcements | ✓ |
| Visitors | /api/visitors | ✓ |
| Parking | /api/parking | ✓ |
| Facilities | /api/facilities | ✓ |
| Payments | /api/payments | ✓ |
| Polls | /api/polls | ✓ |

---

## 💡 Tips

1. **Auto-reload**: Vite hot-reloads changes instantly
2. **API Testing**: Use Postman to test endpoints
3. **Database**: Ensure MongoDB is running locally
4. **Port Conflicts**: Change PORT in .env if 5000/3000 occupied

---

## 🚀 Production Deployment

### Backend (Heroku/Railway)
```bash
npm install
git push
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

---

## 📞 Support

Refer to individual README files:
- `backend/README.md`
- `frontend/README.md`
- `COMPLETE_DOCUMENTATION.md`

---

**Happy coding! 🎉**
