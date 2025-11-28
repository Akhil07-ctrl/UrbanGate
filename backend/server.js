import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import config from './config/config.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import communityRoutes from './routes/communityRoutes.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDB();

// Socket.io for real-time notifications
let activeUsers = {};
let userSockets = {}; // Map userId to socket IDs

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('user_online', (userId) => {
    activeUsers[userId] = socket.id;
    userSockets[userId] = socket.id;
    io.emit('user_status', { userId, status: 'online' });
  });

  socket.on('user_offline', (userId) => {
    delete activeUsers[userId];
    delete userSockets[userId];
    io.emit('user_status', { userId, status: 'offline' });
  });

  // Real-time announcement broadcast
  socket.on('new_announcement', (data) => {
    io.emit('announcement_received', data);
  });

  // Real-time notification
  socket.on('send_notification', (notification) => {
    io.emit('notification_received', notification);
  });

  // Community join request events
  socket.on('join_request_created', (data) => {
    const { communityId, adminId, userId, userName } = data;
    if (userSockets[adminId]) {
      io.to(userSockets[adminId]).emit('new_join_request', {
        communityId,
        userId,
        userName,
        timestamp: new Date()
      });
    }
  });

  socket.on('join_request_approved', (data) => {
    const { userId, communityName } = data;
    if (userSockets[userId]) {
      io.to(userSockets[userId]).emit('request_approved', {
        message: `Your request to join ${communityName} has been approved!`,
        communityName,
        timestamp: new Date()
      });
    }
  });

  socket.on('join_request_rejected', (data) => {
    const { userId, communityName, reason } = data;
    if (userSockets[userId]) {
      io.to(userSockets[userId]).emit('request_rejected', {
        message: `Your request to join ${communityName} has been rejected`,
        communityName,
        reason,
        timestamp: new Date()
      });
    }
  });

  // Member removed from community
  socket.on('member_removed', (data) => {
    const { userId, communityName } = data;
    if (userSockets[userId]) {
      io.to(userSockets[userId]).emit('removed_from_community', {
        message: `You have been removed from ${communityName}`,
        communityName,
        timestamp: new Date()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/communities', communityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = config.port;

server.listen(PORT, () => {
  console.log(`🚀 UrbanGate server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export { io };
