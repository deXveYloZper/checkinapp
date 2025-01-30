// server/index.js

import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import checkinRoutes from './routes/checkin.js';

import { verifyToken, roleCheck } from './middleware/authMiddleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 1) Connect to DB
connectDB();

// 2) JSON parsing
app.use(express.json());

// 3) Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Firenze Check-In API!' });
});

// 4) Auth routes (public)
app.use('/auth', authRoutes);

/*
  5) Check-In routes (protected):
     - Must have a valid token to access.
     - For POST /checkins, only role=owner can create a request.
     - For GET /checkins, role=agent or role=owner can view.
     - For POST /checkins/:id/accept, only role=agent can accept.
*/
app.use('/checkins',
  verifyToken,                // Everyone accessing /checkins must be authenticated
  checkinRoutes
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
