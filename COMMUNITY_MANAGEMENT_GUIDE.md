# 🏢 UrbanGate - Role-Based Community Management System

## 📋 Overview

UrbanGate now has a complete role-based authentication and community management system. The apartment management platform operates on three main roles with distinct workflows:

- **Admin**: Creates and manages communities
- **Residents**: Can join communities to participate in apartment activities
- **Security Guards**: Can join communities to provide security services

---

## 🔐 Role-Based Authentication

### Registration Flow

1. **User Registration** (Removed apartment field)
   - Users select their role during registration: Admin, Resident, or Security Guard
   - No apartment number required at registration
   - Only after community acceptance does a user become part of a community

### User Model Changes

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: enum ['resident', 'admin', 'security'], // Required now
  communityId: ObjectId (reference to Community),
  phone: String,
  profileImage: String,
  isActive: Boolean,
  timestamps: true
}
```

**Removed**: `apartment` field (no longer required)

---

## 🏘️ Community Management

### Community Model

```javascript
{
  name: String (unique),
  description: String,
  location: String,
  adminId: ObjectId (reference to User),
  members: [
    {
      userId: ObjectId,
      role: enum ['admin', 'resident', 'security'],
      joinedAt: Date,
      isActive: Boolean
    }
  ],
  totalMembers: Number,
  facilities: [String], // e.g., ['Gym', 'Pool', 'Parking']
  rules: [String],
  isActive: Boolean,
  timestamps: true
}
```

### Admin Workflow - Create Community

1. **Admin Registration**: User registers as "Admin"
2. **Create Community**: Admin navigates to "Community Management"
3. **Fill Details**:
   - Community Name (unique)
   - Description
   - Location
   - Facilities (optional)
   - Community Rules (optional)
4. **Community Created**: Admin automatically becomes the community admin

### Resident/Security Guard Workflow - Join Community

1. **User Registration**: Register as "Resident" or "Security Guard"
2. **Join Community**: Navigate to "Communities" page
3. **Search Communities**: Search by name, location, or description
4. **Request to Join**: Click "Request to Join" button
5. **Admin Review**: Admin receives notification and reviews request
6. **Admin Approval/Rejection**:
   - **Approve**: User added to community, communityId set
   - **Reject**: User receives rejection reason (optional)
7. **Access Granted**: User can now access community features

---

## 📍 Join Request System

### JoinRequest Model

```javascript
{
  userId: ObjectId (reference to User),
  communityId: ObjectId (reference to Community),
  userRole: enum ['resident', 'security'],
  status: enum ['pending', 'approved', 'rejected'],
  message: String,
  reviewedBy: ObjectId (Admin who reviewed),
  reviewedAt: Date,
  rejectionReason: String,
  timestamps: true
}
```

### Join Request Flow

1. **Create Request**: User submits join request
   - Status: `pending`
   - reviewedBy: null
   
2. **Admin Notification**: Admin sees pending requests in dashboard

3. **Admin Decision**:
   - **Approve**: 
     - Join request status → `approved`
     - User added to community members
     - User's communityId updated
   - **Reject**:
     - Join request status → `rejected`
     - Optional rejection reason sent to user
     - User NOT added to community

---

## 🔑 API Endpoints

### Community Endpoints

#### Public Routes
```
GET /api/communities/all
  Query: { search, page, limit }
  Response: { communities: [], pagination: {} }

GET /api/communities/:id
  Response: { community: {...} }
```

#### Protected Routes (Residents, Security, Admin)
```
GET /api/communities/my-community
  Auth: Required
  Response: { community: {...} }

POST /api/communities/join
  Auth: Required (resident, security)
  Body: { communityId }
  Response: { message, joinRequest: {...} }
```

#### Admin Routes (Admin Only)
```
POST /api/communities/create
  Auth: Required (admin)
  Body: { name, description, location, facilities[], rules[] }
  Response: { community: {...} }

GET /api/communities/admin/join-requests
  Auth: Required (admin)
  Query: { communityId, status }
  Response: { joinRequests: [] }

POST /api/communities/admin/approve-request/:requestId
  Auth: Required (admin)
  Response: { message, joinRequest: {...} }

POST /api/communities/admin/reject-request/:requestId
  Auth: Required (admin)
  Body: { rejectionReason }
  Response: { message, joinRequest: {...} }

DELETE /api/communities/admin/remove-member/:communityId/:memberId
  Auth: Required (admin)
  Response: { message, community: {...} }

PUT /api/communities/admin/update/:communityId
  Auth: Required (admin)
  Body: { name, description, location, facilities[], rules[] }
  Response: { message, community: {...} }

DELETE /api/communities/admin/delete/:communityId
  Auth: Required (admin)
  Response: { message }
```

---

## 🎨 Frontend Pages

### 1. **Communities Page** (`/communities`)

#### For Residents & Security Guards:
- **Search Bar**: Search communities by name, location, or description
- **Community Cards**: Display all available communities
- **Join Button**: Send join request to community admin
- **Status**: Shows community details (admin name, member count, facilities)

#### For Admins:
- **Create Community Form**:
  - Community Name
  - Description
  - Location
  - Facilities (comma-separated)
  - Community Rules (line-by-line)
- **Submit**: Creates new community with admin as owner

### 2. **Community Management Page** (`/community-management`)

**Admin Only View:**

#### Community Details Section:
- Community name and location
- Description
- Total members count
- Facilities list
- Community rules

#### Pending Join Requests Section:
- List of users requesting to join
- User name, email, and role
- **Approve Button**: Accept user into community
- **Reject Button**: Reject with optional reason

#### Members List Section:
- Table showing all active members
- Columns: Name, Email, Role, Joined Date, Actions
- **Remove Button**: Remove member from community (deactivate)
- Can't remove admin

---

## 📊 Database Schema Changes

### Migrations Needed:
1. **Remove** `apartment` field from User schema
2. **Add** `communityId` field to User schema
3. **Create** Community collection
4. **Create** JoinRequest collection

---

## 🔔 Notifications & Real-Time Updates

### Socket.io Events (To Be Implemented):

```javascript
// When admin receives join request
socket.emit('join_request_received', {
  communityId,
  userId,
  userName,
  userEmail,
  userRole
})

// When user's request is approved
socket.emit('join_request_approved', {
  communityId,
  communityName
})

// When user's request is rejected
socket.emit('join_request_rejected', {
  communityId,
  rejectionReason
})

// When member is removed
socket.emit('member_removed', {
  communityId,
  memberId
})
```

---

## 🚀 Feature Highlights

### ✅ Implemented
- ✓ Role-based registration (Admin, Resident, Security)
- ✓ Community creation by admins
- ✓ Community search and discovery
- ✓ Join request workflow
- ✓ Admin approval/rejection system
- ✓ Member management (add/remove)
- ✓ Community details management
- ✓ Member deactivation (delete functionality)

### ⏳ Future Enhancements
- [ ] Socket.io real-time notifications for join requests
- [ ] Email notifications for approvals/rejections
- [ ] Community statistics dashboard
- [ ] Member activity logs
- [ ] Community-specific announcements
- [ ] Role-based permissions within community
- [ ] Community exit/leave functionality
- [ ] Bulk member import/export

---

## 🧪 Testing the System

### Test Scenario 1: Admin Creates Community

1. Register as Admin
2. Go to `/communities`
3. Fill community creation form:
   - Name: "Sunrise Apartments"
   - Description: "A beautiful apartment complex"
   - Location: "Downtown"
   - Facilities: "Gym, Pool, Parking, Clubhouse"
   - Rules: "No noise after 10 PM\nPet policy...\nParking rules..."
4. Click "Create Community"
5. See success message

### Test Scenario 2: Resident Joins Community

1. Register as Resident (or Security Guard)
2. Go to `/communities`
3. Search for "Sunrise Apartments"
4. Click "Request to Join"
5. See "Join request sent successfully"

### Test Scenario 3: Admin Approves Request

1. Login as Admin
2. Go to `/community-management`
3. See pending requests under "Pending Join Requests"
4. Click "Approve" for a user
5. User automatically added to community members
6. Request disappears from pending list

### Test Scenario 4: Admin Rejects Request

1. In Community Management
2. Click "Reject" on a pending request
3. Enter optional rejection reason
4. Click "Reject" in modal
5. User not added to community

### Test Scenario 5: Admin Removes Member

1. In Community Management
2. Scroll to "Community Members"
3. Click "Remove" next to a member
4. Confirm removal
5. Member marked as inactive

---

## 🔐 Security Features

1. **Role-Based Access Control**: Only admins can create/manage communities
2. **Token Authentication**: JWT tokens for all protected routes
3. **Password Hashing**: bcryptjs for secure password storage
4. **Community Ownership**: Only community admin can manage their community
5. **Request Verification**: Admin reviews all join requests before approval

---

## 📝 Demo Credentials

```
Admin:
  Email: admin@example.com
  Password: password123

Resident:
  Email: resident@example.com
  Password: password123

Security:
  Email: security@example.com
  Password: password123
```

### Demo Workflow:
1. Register new admin account
2. Create a community
3. Register as resident/security
4. Join the community created by admin
5. Admin approves the request
6. Resident/Security can now access community

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Frontend**: React, React Router
- **Authentication**: JWT (jsonwebtoken), bcryptjs
- **Real-time**: Socket.io (upcoming notifications)
- **Styling**: Tailwind CSS

---

## 📂 Files Modified/Created

### Backend
- ✓ `models/User.js` - Updated (removed apartment, added communityId)
- ✓ `models/Community.js` - Created (new community model)
- ✓ `models/JoinRequest.js` - Created (join request tracking)
- ✓ `controllers/communityController.js` - Created (all community logic)
- ✓ `controllers/authController.js` - Updated (registration changes)
- ✓ `routes/communityRoutes.js` - Created (all endpoints)
- ✓ `server.js` - Updated (added community routes)

### Frontend
- ✓ `pages/Auth.jsx` - Updated (removed apartment, added role)
- ✓ `pages/Communities.jsx` - Created (join/search communities)
- ✓ `pages/CommunityManagement.jsx` - Created (admin panel)
- ✓ `pages/Dashboard.jsx` - Updated (removed apartment display)
- ✓ `components/Layout.jsx` - Updated (added community nav links)
- ✓ `App.jsx` - Updated (added new routes)

---

## ✨ Next Steps

1. **Restart Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Restart Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the System**:
   - Create admin account
   - Create community
   - Create resident account
   - Join community
   - Admin approves request
   - Verify member in community

4. **Optional - Add Notifications**:
   - Configure Socket.io events in `server.js`
   - Add real-time notifications to frontend

---

## 🎯 Summary

The UrbanGate system now has a complete role-based community management workflow:

1. **Admins** can create and manage communities
2. **Residents/Security** can search and request to join communities
3. **Admins** can approve/reject join requests
4. **Members** can be managed (added/removed) by admin
5. **Community** information is shared with all members

This creates a flexible, scalable system where apartment complexes can be managed by admins and residents/security can participate in the community after approval.
