# UrbanGate - Complete MERN Stack Application

A professional, clean apartment communication and management system with role-based access for residents, administrators, and security personnel.

## 📋 Project Overview

UrbanGate is a comprehensive web application that manages various aspects of apartment complex operations including complaints, announcements, visitor management, parking, facilities booking, maintenance payments, and community polling.

## 🎯 Core Features

### 1. **Complaint Management System (Ticketing)**
- Residents can raise complaints with category, description, and photos
- Track status: Open, In-progress, Resolved
- Admin assigns tickets to maintenance staff
- Add comments and updates to complaints

### 2. **Announcements Board**
- Admin posts announcements: emergency, events, notices
- Residents can filter by category
- Real-time notifications using Socket.io
- Mark urgent announcements for priority display

### 3. **Visitor Management System**
- Residents generate guest passes (name + purpose)
- QR codes are automatically generated
- Security scans QR → logs entry/exit
- Track visitor history

### 4. **Parking Management**
- View assigned resident parking slots
- Request guest parking with date range
- Admin approval/rejection of guest parking requests
- Parking availability status

### 5. **Facility Booking**
- Residents can book clubhouse, gym, guest rooms
- View available time slots
- Admin confirms bookings
- Prevents double-booking conflicts

### 6. **Maintenance Payments**
- Residents can view monthly dues
- Pay online (dummy payment integration)
- Download invoices
- Breakdown of charges (maintenance, water, electricity, parking)

### 7. **Polls & Voting**
- Admin creates polls with multiple options
- Residents vote transparently
- View real-time results with percentages
- Track total votes

## 🏗️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time notifications
- **QRCode** - QR code generation

### Frontend
- **React 18** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io-client** - Real-time client
- **Vite** - Build tool
- **QRCode.react** - QR display

## 📁 Project Structure

```
UrbanGate/
├── backend/
│   ├── config/
│   │   ├── config.js          # Configuration variables
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Complaint.js       # Complaint schema
│   │   ├── Announcement.js    # Announcement schema
│   │   ├── Visitor.js         # Visitor schema
│   │   ├── Parking.js         # Parking schema
│   │   ├── Facility.js        # Facility schema
│   │   ├── Payment.js         # Payment schema
│   │   └── Poll.js            # Poll schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── announcementController.js
│   │   ├── visitorController.js
│   │   ├── parkingController.js
│   │   ├── facilityController.js
│   │   ├── paymentController.js
│   │   └── pollController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── announcementRoutes.js
│   │   ├── visitorRoutes.js
│   │   ├── parkingRoutes.js
│   │   ├── facilityRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── pollRoutes.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── utils/
│   │   └── helpers.js         # JWT & QR code generation
│   ├── uploads/               # File storage
│   ├── server.js              # Entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UI.jsx         # Reusable components
    │   │   └── Layout.jsx     # Layout wrapper
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── Auth.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Complaints.jsx
    │   │   ├── Announcements.jsx
    │   │   ├── VisitorPass.jsx
    │   │   ├── Parking.jsx
    │   │   ├── Facilities.jsx
    │   │   ├── Payments.jsx
    │   │   └── Polls.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── public/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── README.md
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/urbangate
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the server:
   ```bash
   npm run dev      # Development mode with hot reload
   npm start        # Production mode
   ```

   Server runs on: http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

   Frontend runs on: http://localhost:3000

## 🔐 Authentication

### User Roles
1. **Resident** - Can file complaints, book facilities, generate visitor passes
2. **Admin** - Can manage all features, approve requests
3. **Security** - Can scan QR codes and manage visitor check-ins

### Login Flow
1. User registers with email, password, name, apartment number, and phone
2. Backend validates and stores hashed password
3. JWT token generated and returned
4. Token stored in localStorage
5. Token sent with every request in Authorization header

### Demo Credentials
```
Resident:  resident@example.com / password123
Admin:     admin@example.com / password123
Security:  security@example.com / password123
```

## 📊 Database Schema

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (resident/admin/security),
  apartment: String,
  phone: String,
  profileImage: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Complaint Schema
```javascript
{
  title: String,
  description: String,
  category: String (maintenance/cleanliness/noise/water/electricity/security/other),
  priority: String (low/medium/high),
  status: String (open/in-progress/resolved/closed),
  residentId: ObjectId (User),
  assignedTo: ObjectId (User),
  images: [String],
  comments: [{userId, text, createdAt}],
  resolvedAt: Date,
  createdAt: Date
}
```

### Announcement Schema
```javascript
{
  title: String,
  content: String,
  category: String (emergency/event/maintenance/notice/general),
  image: String,
  createdBy: ObjectId (User),
  targetAudience: String (all/residents/security/admin),
  isUrgent: Boolean,
  expiresAt: Date,
  createdAt: Date
}
```

### Visitor Schema
```javascript
{
  guestName: String,
  guestPhone: String,
  purpose: String (visit/delivery/service/other),
  residentId: ObjectId (User),
  apartment: String,
  qrCode: String (unique),
  entryTime: Date,
  exitTime: Date,
  status: String (pending/checked-in/checked-out),
  scannedBy: ObjectId (User),
  validFrom: Date,
  validUntil: Date,
  createdAt: Date
}
```

### Parking Schema
```javascript
{
  slotNumber: String (unique),
  type: String (resident/guest),
  residentId: ObjectId (User),
  isAvailable: Boolean,
  floor: String,
  block: String,
  guestRequests: [{
    requestedBy: ObjectId,
    fromDate: Date,
    toDate: Date,
    status: String (pending/approved/rejected),
    approvedBy: ObjectId
  }],
  createdAt: Date
}
```

### Facility Schema
```javascript
{
  name: String,
  description: String,
  type: String (clubhouse/gym/guest-room/tennis-court/pool/other),
  capacity: Number,
  image: String,
  bookings: [{
    residentId: ObjectId,
    startTime: Date,
    endTime: Date,
    status: String (pending/confirmed/cancelled),
    bookedAt: Date
  }],
  workingHours: {open: String, close: String},
  createdAt: Date
}
```

### Payment Schema
```javascript
{
  residentId: ObjectId (User),
  month: Date,
  amount: Number,
  description: String,
  status: String (pending/paid/overdue),
  paymentMethod: String (online/offline/cheque),
  transactionId: String,
  paidAt: Date,
  dueDate: Date,
  invoiceUrl: String,
  breakdown: {
    maintenance: Number,
    water: Number,
    electricity: Number,
    parking: Number,
    other: Number
  },
  createdAt: Date
}
```

### Poll Schema
```javascript
{
  question: String,
  description: String,
  options: [{
    text: String,
    votes: Number,
    votedBy: [ObjectId]
  }],
  createdBy: ObjectId (User),
  status: String (active/closed),
  targetAudience: String (all/residents/admin),
  allowMultipleVotes: Boolean,
  endsAt: Date,
  createdAt: Date
}
```

## 🎨 Design System

### Color Palette
- **Primary**: #ffffff (White)
- **Secondary**: #f5f5f5 (Light Grey)
- **Tertiary**: #e8e8e8 (Medium Grey)
- **Text**: #333333 (Dark Grey)
- **Text Light**: #666666 (Medium Grey)
- **Text Lighter**: #999999 (Light Grey)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)
- **Warning**: #f59e0b (Orange)
- **Info**: #3b82f6 (Blue)

### Typography
- **Font Family**: Inter (system fonts as fallback)
- **Headings**: Bold weight (700)
- **Body**: Regular weight (400)
- **Buttons**: Medium weight (600)

### Components
- **Button**: Primary, Secondary, Danger, Success variants
- **Card**: Container with subtle shadow
- **Input**: Text, email, password, date, datetime-local types
- **Select**: Dropdown with options
- **Textarea**: Multi-line text input
- **Modal**: Centered dialog overlay
- **Badge**: Status/category tags
- **Alert**: Info, success, error, warning messages
- **Loading**: Spinner animation
- **EmptyState**: Centered message with icon
- **ErrorState**: Error display with retry option

## 📱 Responsive Design

- **Mobile First**: Design prioritizes mobile experience
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Flexible Grid**: CSS Grid and Flexbox for layouts
- **Touch-friendly**: Adequate button/tap sizes

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get complaint detail
- `PUT /api/complaints/:id` - Update complaint
- `POST /api/complaints/:id/comments` - Add comment
- `DELETE /api/complaints/:id` - Delete complaint

### Announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get announcement detail
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Visitor Passes
- `POST /api/visitors/create-pass` - Create visitor pass
- `GET /api/visitors` - Get all visitor passes
- `POST /api/visitors/scan-qr` - Scan QR code
- `DELETE /api/visitors/:id` - Delete visitor pass

### Parking
- `GET /api/parking` - Get all parking slots
- `GET /api/parking/resident/my-slot` - Get resident's slot
- `POST /api/parking/request-guest` - Request guest parking
- `POST /api/parking/approve-guest` - Approve guest parking
- `POST /api/parking/reject-guest` - Reject guest parking

### Facilities
- `POST /api/facilities` - Create facility
- `GET /api/facilities` - Get all facilities
- `POST /api/facilities/:id/book` - Book facility
- `POST /api/facilities/:id/confirm-booking` - Confirm booking
- `POST /api/facilities/:id/cancel-booking` - Cancel booking

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get all payments
- `PUT /api/payments/:id/mark-paid` - Mark as paid
- `GET /api/payments/:id/invoice` - Download invoice

### Polls
- `POST /api/polls` - Create poll
- `GET /api/polls` - Get all polls
- `GET /api/polls/:id` - Get poll detail
- `POST /api/polls/:id/vote` - Vote in poll
- `POST /api/polls/:id/close` - Close poll

## 🔔 Real-time Features (Socket.io)

### Events
- `user_online` - User comes online
- `user_offline` - User goes offline
- `new_announcement` - New announcement posted
- `send_notification` - Send real-time notification
- `announcement_received` - Receive announcement
- `notification_received` - Receive notification

## 🚢 Deployment

### Backend Deployment (Heroku)
1. Install Heroku CLI
2. Create Heroku app: `heroku create urbangate-api`
3. Set environment variables: `heroku config:set MONGODB_URI=...`
4. Deploy: `git push heroku main`

### Frontend Deployment (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel`
3. Set environment variable: `VITE_API_URL=backend_url`

### Docker Deployment
Build and run in containers:
```bash
docker-compose up
```

## 🧪 Testing

### Backend Testing
```bash
npm test
```

### Frontend Testing
```bash
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urbangate
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Payment integration is dummy (stripe/razorpay can be added)
- Email notifications not implemented
- SMS alerts not configured
- Image storage in local uploads folder

### Future Enhancements
- Payment gateway integration (Stripe/Razorpay)
- Email/SMS notifications
- Advanced search and filtering
- Analytics dashboard
- Mobile app (React Native)
- Video conferencing for support
- Maintenance request scheduling
- Emergency alert system
- Audit logs

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Socket.io Documentation](https://socket.io/)

## 📄 License

This project is provided as-is for educational and commercial purposes.

## 👨‍💻 Support

For issues, questions, or contributions, please refer to the individual README files in backend and frontend directories.

---

**UrbanGate** - Making apartment management simple and efficient. 🏢✨
