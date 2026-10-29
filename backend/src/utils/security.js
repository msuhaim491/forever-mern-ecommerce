import jwt from 'jsonwebtoken';
export function signToken(user) { return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
export const safeUser = user => ({ id: user.id, name: user.name, email: user.email, role: user.role });
export function apiError(res, status, message) { return res.status(status).json({ message }); }
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
