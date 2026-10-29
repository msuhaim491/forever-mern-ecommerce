import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, apiError } from '../utils/security.js';
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = /^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
  if (!token) return apiError(res, 401, 'Please sign in first');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { return apiError(res, 401, 'Session expired. Please sign in again'); }
  const user = await User.findById(payload.sub);
  if (!user) return apiError(res, 401, 'Account not found');
  req.user = user;
  next();
});
export function requireAdmin(req, res, next) { if (req.user?.role !== 'admin') return apiError(res, 403, 'Admin access only'); next(); }
