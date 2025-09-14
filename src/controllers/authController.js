import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * sign JWT for user
 */
const signToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Register controller
 */
export const register = async (req, res, next) => {
  try {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'User already exists with this email' });
    }

    const user = new User({ username, email, password });
    await user.save();

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login controller
 */
export const login = async (req, res, next) => {
  try {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    const token = signToken(user);

    // return token (client stores it)
    return res.json({
      status: 'success',
      message: 'Authentication successful',
      token,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get currently logged in user info (taken from token)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user is attached by middleware
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });

    // Optionally fetch latest from DB:
    const fresh = await User.findById(req.user.id).select('-password');
    return res.json({ status: 'success', data: fresh });
  } catch (err) {
    next(err);
  }
};
