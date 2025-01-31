// server/routes/auth.js

import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';
const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user (Owner or Agent)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use.' });
    }

    // 2) Validate role
    if (!['owner', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    // 3) Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4) Create user in DB
    const newUser = new User({
      email,
      password: hashedPassword,
      role
    });
    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /auth/login
 * @desc    Login user and get JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 2) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 3) Create JWT
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // 4) Respond with token
    return res.status(200).json({
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
