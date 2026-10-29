import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes, { handleStripeWebhook } from './routes/orders.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith('REPLACE_')) {
  throw new Error('JWT_SECRET must be a secure random string of at least 32 characters');
}
const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
  process.env.URL, // Netlify's public site origin
  process.env.DEPLOY_PRIME_URL, // Netlify branch deploys
  process.env.DEPLOY_URL
].filter(Boolean).map(x => x.replace(/\/$/,''));
app.use(cors({ origin(origin, cb) { if (!origin || allowedOrigins.includes(origin)) return cb(null,true); cb(new Error('CORS origin blocked')); } }));
// Stripe needs the exact raw request body before express.json() parses it.
app.post('/api/stripe/webhook', express.raw({type:'application/json'}), (req,res,next) => Promise.resolve(handleStripeWebhook(req,res)).catch(next));
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(path.resolve('uploads'), { maxAge: '1d' }));
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'Forever API' }));
const authLimiter = rateLimit({windowMs: 15 * 60 * 1000, limit: 25, standardHeaders:'draft-7', legacyHeaders:false});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use((req, res) => res.status(404).json({message:'Route not found'}));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ message: 'Image limit is 4 MB per image' });
  if (error.name === 'MulterError') return res.status(400).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: 'Duplicate record' });
  res.status(error.status || 500).json({ message: error.status && error.status < 500 ? error.message : 'Server error. Please try again.' });
});
export default app;
