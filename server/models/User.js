// server/models/User.js

import mongoose from 'mongoose';

/*
  The user schema supports:
    - email (unique, lowercased)
    - password (hashed)
    - role ("owner" or "agent")
    - fcmToken for push notifications
*/

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'agent'],
      required: true
    },
    name: 
    { type: String, default: '' },
    fcmToken: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index the email field for faster unique lookups
userSchema.index({ email: 1 }, { unique: true });

// You can also add pre-save password hashing if you want it at the model level
// but currently, we do hashing in auth routes.

export default mongoose.model('User', userSchema);
