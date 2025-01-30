// server/routes/checkin.js

import { Router } from 'express';
import CheckInRequest from '../models/CheckInRequest.js';

const router = Router();

/**
 * @route   POST /checkins
 * @desc    Owner creates a new check-in request
 * @access  Owner only
 */
router.post('/', async (req, res) => {
  try {
    const { propertyAddress, checkInTime, guestCount } = req.body;
    const ownerId = req.user.id; // from token

    const newRequest = new CheckInRequest({
      ownerId,
      propertyAddress,
      checkInTime,
      guestCount
    });

    await newRequest.save();
    res.status(201).json({ message: 'Check-in request created.', newRequest });
  } catch (error) {
    console.error('Create check-in request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /checkins
 * @desc    (UPDATED) 
 *   - Agent => can see either open requests or the ones they accepted,
 *     depending on query parameters.
 *   - Owner => can see their own requests, optionally filtered by status (?status=...)
 * @access  Agent or Owner
 */
router.get('/', async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;
    
    // Read optional "status" query param
    // e.g., /checkins?status=accepted
    const { status } = req.query;

    if (role === 'agent') {
      /*
        If agent does not provide ?status, we assume "open" by default (like before).
        If agent provides ?status=accepted, we return requests where agentId = agent's ID.
      */

      if (!status) {
        // No query param => default to open requests
        const openRequests = await CheckInRequest.find({ status: 'open' }).sort({ createdAt: -1 });
        return res.json(openRequests);
      } else if (status === 'accepted') {
        // Show requests this agent accepted
        const myAccepted = await CheckInRequest.find({
          status: 'accepted',
          agentId: userId
        }).sort({ createdAt: -1 });
        return res.json(myAccepted);
      } else if (status === 'completed') {
        // If agent wants to see completed requests they handled
        const myCompleted = await CheckInRequest.find({
          status: 'completed',
          agentId: userId
        }).sort({ createdAt: -1 });
        return res.json(myCompleted);
      } else {
        return res.status(400).json({ error: 'Invalid status for agent.' });
      }

    } else if (role === 'owner') {
      /*
        Owners see only their own requests.
        If ?status is provided, filter by that status as well.
      */
      const filter = { ownerId: userId };
      if (status) {
        // e.g., /checkins?status=accepted
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
 * @desc    Agent accepts an open request
 * @access  Agent only
 */
router.post('/:id/accept', async (req, res) => {
  try {
    const agentId = req.user.id; // from token
    const requestId = req.params.id;

    const request = await CheckInRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    if (request.status !== 'open') {
      return res.status(400).json({ error: 'Request is not open for acceptance.' });
    }

    // Assign agent
    request.agentId = agentId;
    request.status = 'accepted';
    await request.save();

    res.json({ message: 'Request accepted.', request });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /checkins/:id/complete
 * @desc    (NEW) Agent completes a request they accepted.
 * @access  Agent only
 */
router.post('/:id/complete', async (req, res) => {
  try {
    const agentId = req.user.id;
    const requestId = req.params.id;

    // 1) Find the request
    const request = await CheckInRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    // 2) Check if the agent calling is indeed the one who accepted it
    if (request.agentId?.toString() !== agentId) {
      return res.status(403).json({ error: 'You are not assigned to this request.' });
    }

    // 3) Ensure the request is in 'accepted' status
    if (request.status !== 'accepted') {
      return res.status(400).json({ error: 'Request is not in an acceptable state to complete.' });
    }

    // 4) Mark it completed
    request.status = 'completed';
    await request.save();

    res.json({ message: 'Request completed.', request });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
