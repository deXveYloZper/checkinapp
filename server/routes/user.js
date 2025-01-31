// server/routes/user.js

import { Router } from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route   POST /user/fcmToken
 * @desc    Save or update the user's FCM token
 * @access  Authenticated users
 */
router.post('/fcmToken', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: 'fcmToken is required' });
    }

    // update the user's record
    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    return res.json({ message: 'FCM token updated', user });
  } catch (error) {
    console.error('Update FCM token error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
