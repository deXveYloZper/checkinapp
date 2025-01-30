// server/models/User.js

import mongoose from 'mongoose';

/*
  This user schema supports:
    - email (unique)
    - password (hashed via bcrypt)
    - role ("owner" or "agent")
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
    }
  },
  {
    timestamps: true // automatically adds createdAt, updatedAt fields
  }
);

// Export as a Mongoose model named "User"
export default mongoose.model('User', userSchema);
