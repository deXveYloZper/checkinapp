// server/routes/checkin.js

import { Router } from 'express';
import CheckInRequest from '../models/CheckInRequest.js';
import User from '../models/User.js';
import { sendFCMNotification } from '../services/fcm.js';

// Import the global IO reference
import { getIO } from '../utils/socket.js';

const router = Router();

/**
 * @route   POST /checkins
 * @desc    Owner creates a new check-in request
 */
router.post('/', async (req, res) => {
  try {
    const { propertyAddress, checkInTime, guestCount } = req.body;
    const ownerId = req.user.id;

    const newRequest = new CheckInRequest({
      ownerId,
      propertyAddress,
      checkInTime,
      guestCount
    });
    await newRequest.save();

    // 1) Emit socket event to all agents about a new request
    const io = getIO();
    if (io) {
      io.emit('newRequest', newRequest);
    }

    // 2) Push FCM to all agents with fcmToken
    const agents = await User.find({ role: 'agent', fcmToken: { $ne: null } });
    for (const agent of agents) {
      await sendFCMNotification(
        agent.fcmToken,
        'New Check-In Request',
        `A new request at ${propertyAddress} just posted.`
      );
    }

    return res.status(201).json({
      message: 'Check-in request created.',
      newRequest
    });
  } catch (error) {
    console.error('Create check-in request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /checkins
 * @desc    - Agent => open or accepted/completed
 *          - Owner => only their requests, optional ?status=...
 * @access  Agent or Owner
 */
router.get('/', async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    const { status } = req.query;

    if (role === 'agent') {
      if (!status) {
        // no query => open requests
        const openRequests = await CheckInRequest.find({ status: 'open' }).sort({ createdAt: -1 });
        return res.json(openRequests);
      } else if (status === 'accepted') {
        const myAccepted = await CheckInRequest.find({
          status: 'accepted',
          agentId: userId
        }).sort({ createdAt: -1 });
        return res.json(myAccepted);
      } else if (status === 'completed') {
        const myCompleted = await CheckInRequest.find({
          status: 'completed',
          agentId: userId
        }).sort({ createdAt: -1 });
        return res.json(myCompleted);
      } else {
        return res.status(400).json({ error: 'Invalid status for agent.' });
      }
    } else if (role === 'owner') {
      const filter = { ownerId: userId };
      if (status) {
        filter.status = status;
      }
      const myRequests = await CheckInRequest.find(filter).sort({ createdAt: -1 });
      return res.json(myRequests);
    } else {
      return res.status(403).json({ error: 'Unknown role or not permitted.' });
    }
  } catch (error) {
    console.error('Get check-in requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /checkins/:id/accept
 */
router.post('/:id/accept', async (req, res) => {
  try {
    const agentId = req.user.id;
    const requestId = req.params.id;

    const request = await CheckInRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    if (request.status !== 'open') {
      return res.status(400).json({ error: 'Request is not open.' });
    }

    request.agentId = agentId;
    request.status = 'accepted';
    await request.save();

    // 1) Socket event to the owner or all
    const io = getIO();
    if (io) {
      // If the owner is in a specific room => `request-${requestId}`
      // or just broadcast for simplicity:
      io.to(`request-${requestId}`).emit('requestAccepted', request);
    }

    // 2) FCM push to the owner
    const ownerUser = await User.findById(request.ownerId);
    if (ownerUser?.fcmToken) {
      await sendFCMNotification(
        ownerUser.fcmToken,
        'Request Accepted',
        `Your request at ${request.propertyAddress} is now accepted.`
      );
    }

    return res.json({ message: 'Request accepted.', request });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /checkins/:id/complete
 * @desc    Agent completes a request they accepted
 * @access  Agent only
 */
router.post('/:id/complete', async (req, res) => {
  try {
    const agentId = req.user.id;
    const requestId = req.params.id;

    const request = await CheckInRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.agentId?.toString() !== agentId) {
      return res.status(403).json({ error: 'You are not assigned to this request.' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ error: 'Request is not in an acceptable state to complete.' });
    }

    request.status = 'completed';
    await request.save();

    return res.json({ message: 'Request completed.', request });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
