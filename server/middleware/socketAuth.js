// server/middleware/socketAuth.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

/**
 * verifySocketToken - Socket.IO middleware for JWT auth.
 * Expects the client to send: io('url', { auth: { token: '...' } })
 */
export function verifySocketToken(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('No token provided in socket auth'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // e.g. { id, role, iat, exp }

    next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    return next(new Error('Unauthorized socket connection'));
  }
}
