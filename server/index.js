// server/index.js
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { verifyToken } from './middleware/authMiddleware.js';
import { verifySocketToken } from './middleware/socketAuth.js';

import authRoutes from './routes/auth.js';
import checkinRoutes from './routes/checkin.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';

import { Server } from 'socket.io';
import { setIO } from './utils/socket.js';

const app = express();
connectDB();

app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Firenze Check-In API with Real-Time Features!' });
});

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/user', userRoutes);
app.use('/checkins', verifyToken, checkinRoutes);
app.use('/chat', verifyToken, chatRoutes);

// Create HTTP server
const httpServer = http.createServer(app);

// Attach Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*', // or specify your client URL
  }
});

// Store `io` globally
setIO(io);

// Socket.io JWT middleware
io.use(verifySocketToken);

// Connection events
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'User:', socket.user);

  socket.on('joinRequestRoom', (requestId) => {
    socket.join(`request-${requestId}`);
    console.log(`User ${socket.user.id} joined room request-${requestId}`);
  });

  socket.on('typing', ({ requestId, isTyping }) => {
    socket.to(`request-${requestId}`).emit('typing', {
      userId: socket.user.id,
      isTyping,
    });
  });

  // Basic chat message
  socket.on('message', ({ requestId, text }) => {
    // Could store offline in ChatMessage model, then broadcast:
    io.to(`request-${requestId}`).emit('message', {
      user: socket.user.id,
      text,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
