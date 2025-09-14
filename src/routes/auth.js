import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';


const router = Router();

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('username is required'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 chars')
  ],
  register
);

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('valid email is required'),
    body('password').notEmpty().withMessage('password is required')
  ],
  login
);

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
router.get('/me', verifyToken, getMe);

export default router;
