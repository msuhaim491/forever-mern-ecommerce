import { Router } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { apiError, asyncHandler } from '../utils/security.js';
const router = Router();
const stripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) throw Object.assign(new Error('Stripe is not configured. Use COD or add STRIPE_SECRET_KEY.'), { status: 503 });
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};
const addressSchema = z.object({ firstName: z.string().trim().min(2).max(80), lastName: z.string().trim().min(1).max(80), email: z.string().trim().email(), phone: z.string().trim().min(5).max(25), street: z.string().trim().min(5).max(200), city: z.string().trim().min(2).max(100), state: z.string().trim().min(2).max(100), zipcode: z.string().trim().min(2).max(30), country: z.string().trim().min(2).max(80) });
const orderSchema = z.object({ address: addressSchema, items: z.array(z.object({ product: z.string().regex(/^[0-9a-f]{24}$/i), size: z.string(), quantity: z.number().int().min(1).max(30) })).min(1).max(50), paymentMethod: z.enum(['COD','Stripe']) });
const cents = n => Math.round(n * 100);
const deliveryFee = () => Math.max(0, Math.round(Number(process.env.DELIVERY_FEE ?? 10) * 100) / 100);
async function finishPaidOrder(order, session) {
  if (session.payment_status !== 'paid' || session.metadata?.orderId !== String(order._id) || session.amount_total !== cents(order.total) || session.currency !== (process.env.STRIPE_CURRENCY || 'usd').toLowerCase()) return false;
  if (order.paymentStatus !== 'paid') { order.paymentStatus = 'paid'; order.paidAt = new Date(); await order.save(); }
  return true;
}
export async function handleStripeWebhook(req, res) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).send('Stripe webhook not configured');
  let event;
  try { event = stripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET); }
  catch (e) { return res.status(400).send(`Invalid webhook: ${e.message}`); }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    const order = await Order.findOne({ stripeSessionId: session.id, paymentMethod: 'Stripe' });
    if (order) await finishPaidOrder(order, session);
  }
  return res.json({ received: true });
}
router.use(requireAuth);
router.post('/', asyncHandler(async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return apiError(res, 400, parsed.error.issues[0]?.message || 'Invalid order');
  const { address, items, paymentMethod } = parsed.data;
  if (new Set(items.map(i=>i.product + ':' + i.size)).size !== items.length) return apiError(res, 400, 'Duplicate item');
  const products = await Product.find({ _id: { $in: items.map(i=>i.product) }, active: true }).lean();
  const lookup = new Map(products.map(p=>[String(p._id),p]));
  const lines = [];
  for (const item of items) {
    const product = lookup.get(item.product);
    if (!product || !product.sizes.includes(item.size)) return apiError(res, 400, 'A product or size is no longer available');
    lines.push({ product: product._id, name: product.name, image: product.images[0], price: product.price, quantity: item.quantity, size: item.size });
  }
  const subtotalCents = lines.reduce((sum, line)=>sum + cents(line.price) * line.quantity, 0);
  const feeCents = cents(deliveryFee());
  const totalCents = subtotalCents + feeCents;
  if (paymentMethod === 'Stripe' && !process.env.STRIPE_SECRET_KEY) return apiError(res, 503, 'Stripe not configured. Choose cash on delivery.');
  const order = await Order.create({ user: req.user.id, address, items: lines, paymentMethod, subtotal: subtotalCents / 100, deliveryFee: feeCents / 100, total: totalCents / 100 });
  if (paymentMethod === 'COD') {
    req.user.cart = []; await req.user.save();
    return res.status(201).json({ order, method: 'COD' });
  }
  try {
    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    const session = await stripe().checkout.sessions.create({
      mode: 'payment', client_reference_id: String(req.user.id), customer_email: address.email,
      payment_method_types: ['card'],
      line_items: [
        ...lines.map(line => ({ price_data: { currency, unit_amount: cents(line.price), product_data: { name: `${line.name} (${line.size})` } }, quantity: line.quantity })),
        ...(feeCents ? [{ price_data: { currency, unit_amount: feeCents, product_data: { name: 'Delivery' } }, quantity: 1 }] : [])
      ],
      metadata: { orderId: String(order._id) },
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-result?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/cart?cancelled=1`
    }, { idempotencyKey: `checkout-${order._id}` });
    order.stripeSessionId = session.id; await order.save();
    res.status(201).json({ method: 'Stripe', url: session.url, orderId: order.id });
  } catch (err) {
    await Order.deleteOne({ _id: order._id, paymentStatus: 'unpaid' });
    throw err;
  }
}));
router.get('/mine', asyncHandler(async (req, res) => res.json({ orders: await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean() })));
router.get('/verify-session', asyncHandler(async (req, res) => {
  if (!req.query.session_id || typeof req.query.session_id !== 'string') return apiError(res, 400, 'Session ID required');
  const order = await Order.findOne({ stripeSessionId: req.query.session_id, user: req.user.id, paymentMethod: 'Stripe' });
  if (!order) return apiError(res, 404, 'Order not found');
  const session = await stripe().checkout.sessions.retrieve(order.stripeSessionId);
  const paid = await finishPaidOrder(order, session);
  if (paid) { req.user.cart = []; await req.user.save(); }
  res.json({ paid, orderId: order.id, status: order.status });
}));
router.get('/admin/all', requireAdmin, asyncHandler(async (_, res) => res.json({ orders: await Order.find().sort({ createdAt: -1 }).populate('user','name email').lean() })));
router.patch('/admin/:id/status', requireAdmin, asyncHandler(async (req, res) => {
  const allowed = ['Order Placed','Packing','Shipped','Out for delivery','Delivered','Cancelled'];
  if (!allowed.includes(req.body.status)) return apiError(res, 400, 'Unknown status');
  if (!/^[0-9a-f]{24}$/i.test(req.params.id)) return apiError(res, 404, 'Order not found');
  const order = await Order.findById(req.params.id);
  if (!order) return apiError(res, 404, 'Order not found');
  if (order.status === 'Cancelled' && req.body.status !== 'Cancelled') return apiError(res, 400, 'Cancelled orders cannot be reopened');
  if (order.paymentMethod === 'Stripe' && order.paymentStatus !== 'paid' && !['Order Placed','Cancelled'].includes(req.body.status)) return apiError(res, 400, 'Stripe payment is not confirmed; do not fulfill this order');
  if (req.body.status === 'Cancelled' && order.paymentStatus === 'paid') return apiError(res, 400, 'Refund payment in Stripe first. Automatic refunds are not supported.');
  order.status = req.body.status; await order.save();
  res.json({ order });
}));
router.get('/admin/stats', requireAdmin, asyncHandler(async (_, res) => {
  const [totalOrders, products, customers, revenueRows] = await Promise.all([
    Order.countDocuments(), Product.countDocuments({active:true}),
    (await import('../models/User.js')).default.countDocuments({ role: 'customer' }),
    Order.aggregate([{ $match: { $or: [{ paymentStatus: 'paid' }, { paymentMethod: 'COD', status: 'Delivered' }] } }, { $group: { _id: null, revenue: { $sum: '$total' } } }])
  ]);
  res.json({ stats: { orders: totalOrders, products, customers, revenue: revenueRows[0]?.revenue || 0 } });
}));
export default router;
