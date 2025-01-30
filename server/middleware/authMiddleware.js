// server/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

/**
 * verifyToken - checks for a JWT in the Authorization header and decodes it.
 * Attaches decoded { id, role } to req.user if valid.
 */
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided.' });
    }

    // Expecting format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization format.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach decoded user info to request
    req.user = decoded; // e.g., { id: ..., role: ... }
    next();
  } catch (error) {
    console.error('verifyToken error:', error.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * roleCheck - returns a middleware that checks if user has the required role(s).
 * e.g. roleCheck('owner') or roleCheck('agent').
 */
export function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    try {
      // req.user should be set by verifyToken
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: insufficient role' });
      }
      next();
    } catch (error) {
      console.error('roleCheck error:', error.message);
      return res.status(403).json({ error: 'Access denied.' });
    }
  };
}
