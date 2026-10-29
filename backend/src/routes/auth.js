import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import { asyncHandler, apiError, safeUser, signToken } from '../utils/security.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(8).max(100) });
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });
router.post('/register', asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'Enter a valid name, email and password (at least 8 characters)');
  const { name, email, password } = parsed.data;
  if (await User.exists({ email: email.toLowerCase() })) return apiError(res, 409, 'Email already registered');
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'customer' });
  res.status(201).json({ token: signToken(user), user: safeUser(user) });
}));
router.post('/login', asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, 'Invalid login details');
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return apiError(res, 401, 'Incorrect email or password');
  res.json({ token: signToken(user), user: safeUser(user) });
}));
router.get('/me', requireAuth, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
