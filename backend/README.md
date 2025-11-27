# UrbanGate Backend

Apartment communication and management system backend built with Node.js, Express, and MongoDB.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your MongoDB URI and JWT secret.

3. **Start the Server**
   ```bash
   # Development (with hot reload)
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Complaints
- `POST /api/complaints` - Create complaint (resident only)
- `GET /api/complaints` - Get complaints
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint (admin/security)
- `POST /api/complaints/:id/comments` - Add comment
- `DELETE /api/complaints/:id` - Delete complaint

### Announcements
- `POST /api/announcements` - Create announcement (admin only)
- `GET /api/announcements` - Get announcements
- `GET /api/announcements/:id` - Get announcement details
- `PUT /api/announcements/:id` - Update announcement (admin)
- `DELETE /api/announcements/:id` - Delete announcement (admin)

### Visitors
- `POST /api/visitors/create-pass` - Create visitor pass (resident)
- `GET /api/visitors` - Get visitor passes
- `POST /api/visitors/scan-qr` - Scan QR code (security)
- `DELETE /api/visitors/:id` - Delete visitor pass

### Parking
- `GET /api/parking` - Get parking slots
- `GET /api/parking/resident/my-slot` - Get resident's parking (resident)
- `POST /api/parking/request-guest` - Request guest parking (resident)
- `POST /api/parking/approve-guest` - Approve guest parking (admin)
- `POST /api/parking/reject-guest` - Reject guest parking (admin)

### Facilities
- `POST /api/facilities` - Create facility (admin)
- `GET /api/facilities` - Get facilities
- `POST /api/facilities/:id/book` - Book facility (resident)
- `POST /api/facilities/:id/confirm-booking` - Confirm booking (admin)
- `POST /api/facilities/:id/cancel-booking` - Cancel booking (admin)

### Payments
- `POST /api/payments` - Create payment (admin)
- `GET /api/payments` - Get payments
- `PUT /api/payments/:id/mark-paid` - Mark as paid (resident)
- `GET /api/payments/:id/invoice` - Download invoice

### Polls
- `POST /api/polls` - Create poll (admin)
- `GET /api/polls` - Get polls
- `GET /api/polls/:id` - Get poll details
- `POST /api/polls/:id/vote` - Vote in poll
- `POST /api/polls/:id/close` - Close poll (admin)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Roles

- **Resident**: Can raise complaints, book facilities, manage visitor passes
- **Admin**: Can manage complaints, create announcements, manage facilities
- **Security**: Can scan QR codes, manage visitor check-ins
