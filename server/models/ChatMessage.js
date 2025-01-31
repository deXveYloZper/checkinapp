// server/models/ChatMessage.js

import mongoose from 'mongoose';

/*
  This schema stores individual chat messages.
  - requestId: links to the CheckInRequest
  - senderId: who sent the message
  - text: the content
  - timestamp: when the message was sent
*/

const chatMessageSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CheckInRequest',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Optional: Indexes for faster lookups (e.g., if you do heavy searching by requestId)
chatMessageSchema.index({ requestId: 1, timestamp: -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
