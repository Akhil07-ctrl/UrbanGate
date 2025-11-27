# Socket.io Real-Time Notifications Implementation

## Overview
Implemented real-time notifications using Socket.io for community management events including join requests, approvals, rejections, and member removals.

## Backend Implementation

### Updated Files

#### 1. **server.js** - Enhanced Socket.io Setup
- Added `userSockets` mapping to track user-to-socket associations
- Implemented event handlers:
  - `user_online` / `user_offline`: Track user presence
  - `join_request_created`: Notify admin of new join requests
  - `join_request_approved`: Notify user of approval
  - `join_request_rejected`: Notify user of rejection
  - `member_removed`: Notify user of removal from community

#### 2. **communityController.js** - Socket Event Emissions
- Added Socket.io import: `import { io } from '../server.js'`
- Modified controller methods to emit events:
  - `requestJoinCommunity()`: Emits `join_request_created` to admin
  - `approveJoinRequest()`: Emits `join_request_approved` to user
  - `rejectJoinRequest()`: Emits `join_request_rejected` to user
  - `removeMember()`: Emits `member_removed` to member

### Event Structure

```javascript
// Join Request Created
{
  communityId: String,
  adminId: String,
  userId: String,
  userName: String,
  communityName: String
}

// Join Request Approved
{
  userId: String,
  communityName: String,
  message: "Your request to join {communityName} has been approved!"
}

// Join Request Rejected
{
  userId: String,
  communityName: String,
  reason: String,
  message: "Your request to join {communityName} has been rejected"
}

// Member Removed
{
  userId: String,
  communityName: String,
  message: "You have been removed from {communityName}"
}
```

## Frontend Implementation

### New Files Created

#### 1. **src/hooks/useSocket.js** - Socket Connection Hook
- Initializes Socket.io connection on user login
- Registers user online status
- Handles connection/disconnection events
- Auto-reconnects with configurable delays

#### 2. **src/context/NotificationContext.jsx** - Notification State Management
- Global notification context for managing toast notifications
- `addNotification()`: Add notification with auto-dismiss after 5 seconds
- `removeNotification()`: Manually remove notification
- Unique IDs for each notification

#### 3. **src/components/NotificationCenter.jsx** - UI Component
- Displays notifications in bottom-right corner
- Three types: success, error, info
- Slide-in animation
- Close button for manual dismissal

### Updated Files

#### 1. **src/App.jsx** - Provider Setup
- Added `NotificationProvider` wrapper
- Added `NotificationCenter` component for display
- Maintains existing `AuthProvider` and `SocketProvider`

#### 2. **src/pages/CommunityManagement.jsx** - Admin Notifications
- Integrated `useSocket()` hook
- Integrated `useNotification()` hook
- Listens for `new_join_request` events
- Shows notification when new join request arrives
- Auto-refreshes community data

#### 3. **src/pages/Communities.jsx** - User Notifications
- Integrated `useSocket()` hook
- Integrated `useNotification()` hook
- Listens for:
  - `request_approved`: Success notification
  - `request_rejected`: Error notification with reason
  - `removed_from_community`: Error notification
- Handles community list refresh on removal

#### 4. **src/index.css** - Animation Styles
- Added `@keyframes slideIn` animation (400px from right)
- Added `.animate-slide-in` class for notifications
- Smooth 0.3s ease-out transition

### Notification Types

```javascript
// Success Notification
{
  type: 'success',
  title: 'Request Approved',
  message: 'Your request to join {community} has been approved!'
}

// Error Notification
{
  type: 'error',
  title: 'Request Rejected',
  message: 'Your request to join {community} has been rejected: {reason}'
}

// Info Notification
{
  type: 'info',
  title: 'New Join Request',
  message: '{userName} requested to join {communityName}'
}
```

## User Flow

### Admin Perspective
1. Admin is logged in and connected via Socket.io
2. Resident sends join request → API call triggers `io.emit('join_request_created')`
3. Admin receives real-time notification in NotificationCenter
4. Admin panel auto-refreshes to show new request
5. Admin approves → `io.emit('join_request_approved')` sent to resident

### Resident/Security Guard Perspective
1. User is logged in and connected via Socket.io
2. User sends join request → API call successful
3. When admin approves → User receives success notification
4. When admin rejects → User receives error notification with reason
5. If removed from community → User receives notification and community list updates

## Features

✅ Real-time event delivery
✅ Targeted notifications (only to specific users)
✅ Auto-dismiss after 5 seconds
✅ Manual dismissal via close button
✅ Smooth slide-in animation
✅ Color-coded by status (success/error/info)
✅ Graceful reconnection handling
✅ User presence tracking

## Testing

To test the implementation:

1. Open two browser windows (Admin and Resident)
2. Login as Admin in window 1
3. Login as Resident in window 2
4. On Resident window, search and request to join community
5. Check Admin window - should see notification in real-time
6. Admin approves request
7. Check Resident window - should see success notification

## Configuration

Socket.io connection settings in `useSocket.js`:
```javascript
const newSocket = io(SOCKET_URL, {
  auth: { userId: user.id },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

CORS settings in `server.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});
```

## Dependencies

- `socket.io-client: ^4.7.2` (already installed)
- `socket.io: ^4.5.0+` (backend - included in project)
