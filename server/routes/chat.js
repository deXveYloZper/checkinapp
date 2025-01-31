// server/routes/chat.js

import { Router } from 'express';
import ChatMessage from '../models/ChatMessage.js';
import { sendFCMNotification } from '../services/fcm.js';
import User from '../models/User.js';
import CheckInRequest from '../models/CheckInRequest.js'; // might be needed if you want to find agent/owner

const router = Router();

/**
 * @route   GET /chat/:requestId
 * @desc    Get last X messages for a request
 */
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    // (Optional) Validate user has permission to see this request's chat
    // e.g., if (req.user.role === 'owner'), confirm they own the request, etc.

    const messages = await ChatMessage.find({ requestId })
      .sort({ timestamp: -1 })
      .limit(50);

    // Return in chronological order (oldest first)
    return res.json(messages.reverse());
  } catch (error) {
    console.error('Chat GET error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /chat/:requestId
 * @desc    Post a new chat message (if user can't do Socket)
 */
router.post('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text } = req.body;
    const senderId = req.user.id;

    // 1) Create a new chat message
    const chatMsg = new ChatMessage({
      requestId,
      senderId,
      text
    });
    await chatMsg.save();

    // 2) If the recipient is offline, send them an FCM push
    // Figure out the "other side":
    // - If the sender is owner, then the "other" is the agent assigned (if any).
    // - If the sender is agent, the "other" is the request owner.

    const request = await CheckInRequest.findById(requestId);
    if (request) {
      let recipientId;
      if (req.user.role === 'owner') {
        // Owner sending => find agent
        recipientId = request.agentId; // might be null if not accepted yet
      } else if (req.user.role === 'agent') {
        // Agent sending => find owner
        recipientId = request.ownerId;
      }
      if (recipientId) {
        const recipient = await User.findById(recipientId);
        if (recipient?.fcmToken) {
          await sendFCMNotification(
            recipient.fcmToken,
            'New Chat Message',
            text.substring(0, 50), // just a preview
            { requestId }
          );
        }
      }
    }

    return res.json({ message: 'Message posted.', chatMsg });
  } catch (error) {
    console.error('Chat POST error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
