// server/models/CheckInRequest.js

import mongoose from 'mongoose';

const checkInRequestSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    propertyAddress: {
      type: String,
      required: true
    },
    checkInTime: {
      type: Date,
      required: true
    },
    guestCount: {
      type: Number,
      default: 1
    },
    // agentId will be null or undefined if no agent has accepted yet
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // optional status to track if request is 'open', 'accepted', 'completed'
    status: {
      type: String,
      enum: ['open', 'accepted', 'completed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('CheckInRequest', checkInRequestSchema);
