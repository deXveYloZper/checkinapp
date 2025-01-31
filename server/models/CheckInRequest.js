// server/models/CheckInRequest.js

import mongoose from 'mongoose';

/*
  CheckInRequest schema tracks:
   - ownerId: the property owner
   - propertyAddress, checkInTime, guestCount
   - agentId: set once an agent accepts
   - status: "open", "accepted", or "completed"
*/

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
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'completed'],
      default: 'open'
    }
  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);

// Optional: Index on status for quicker queries on open/accepted requests
checkInRequestSchema.index({ status: 1, createdAt: -1 });

// Potentially index ownerId or agentId if you do frequent lookups by user
checkInRequestSchema.index({ ownerId: 1 });
checkInRequestSchema.index({ agentId: 1 });

export default mongoose.model('CheckInRequest', checkInRequestSchema);
