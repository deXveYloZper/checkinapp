// server/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/*
  We'll read the MONGO_URI from the .env file.
  If it's not set, we'll default to an empty string, which triggers an error.
*/
const MONGO_URI = process.env.MONGO_URI || '';

export async function connectDB() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
}
