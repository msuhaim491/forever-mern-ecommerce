import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { z } from 'zod';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { apiError, asyncHandler } from '../utils/security.js';
const router = Router();
// Local disk uploads work in development, but a Netlify Function filesystem is ephemeral.
const serverlessRuntime = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const imageDir = serverlessRuntime ? null : path.resolve('uploads');
if (imageDir) fs.mkdirSync(imageDir, { recursive: true });
const upload = multer({
  storage: serverlessRuntime ? multer.memoryStorage() : multer.diskStorage({ destination: imageDir, filename: (_, f, done) => done(null, crypto.randomUUID() + ({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}[f.mimetype] || '.bin')) }),
  limits: { fileSize: 4 * 1024 * 1024, files: 4 },
  fileFilter: (_, file, done) => done(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
const safeImageUrl = z.string().url().refine(url=>/^https?:\/\//i.test(url), 'Image URL must use HTTP or HTTPS');
const schema = z.object({ name: z.string().trim().min(2).max(150), description: z.string().trim().min(5).max(4000), price: z.coerce.number().min(.5).max(100000), category: z.enum(['Men','Women','Kids']), subCategory: z.enum(['Topwear','Bottomwear','Winterwear']), sizes: z.array(z.string().min(1)).min(1), images: z.array(safeImageUrl).min(1), bestseller: z.boolean().default(false), active: z.boolean().default(true) });
const normalize = (body, files=[]) => ({
  ...body, sizes: typeof body.sizes === 'string' ? body.sizes.split(',').map(s=>s.trim()).filter(Boolean) : body.sizes,
  images: [...(typeof body.images === 'string' ? body.images.split(/[\n,]/).map(s=>s.trim()).filter(Boolean) : body.images || []),
    ...files.map(file=>`${(process.env.PUBLIC_API_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/,'')}/uploads/${file.filename}`)],
  bestseller: body.bestseller === true || body.bestseller === 'true',
  active: body.active === undefined ? true : body.active === true || body.active === 'true'
});
router.get('/', asyncHandler(async (req, res) => {
  const filter = { active: true };
  const { category, subCategory, search, bestseller, sort, limit } = req.query;
  if (category && ['Men','Women','Kids'].includes(category)) filter.category = category;
  if (subCategory && ['Topwear','Bottomwear','Winterwear'].includes(subCategory)) filter.subCategory = subCategory;
  if (bestseller === 'true') filter.bestseller = true;
  if (search && typeof search === 'string') filter.name = { $regex: search.slice(0,80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  const order = sort === 'price-asc' ? { price: 1 } : sort === 'price-desc' ? { price: -1 } : { createdAt: -1 };
  const products = await Product.find(filter).sort(order).limit(Math.max(1,Math.min(Number(limit) || 120, 120))).lean();
  res.json({ products });
}));
router.get('/admin/all', requireAuth, requireAdmin, asyncHandler(async (_, res) => res.json({ products: await Product.find().sort({createdAt:-1}).lean() })));
router.get('/:id', asyncHandler(async (req, res) => {
  if (!/^[0-9a-f]{24}$/i.test(req.params.id)) return apiError(res, 404, 'Product not found');
  const product = await Product.findById(req.params.id).lean();
  if (!product || !product.active) return apiError(res, 404, 'Product not found');
  res.json({ product });
}));
router.post('/', requireAuth, requireAdmin, upload.array('files', 4), asyncHandler(async (req, res) => {
  if (serverlessRuntime && req.files?.length) return apiError(res, 422, 'Image files cannot be stored permanently on the free serverless demo. Enter external HTTPS image URLs instead.');
  const parsed = schema.safeParse(normalize(req.body, req.files));
  if (!parsed.success) return apiError(res, 400, parsed.error.issues.map(x=>x.message).join(', '));
  const product = await Product.create(parsed.data);
  res.status(201).json({ product });
}));
router.put('/:id', requireAuth, requireAdmin, upload.array('files', 4), asyncHandler(async (req, res) => {
  if (serverlessRuntime && req.files?.length) return apiError(res, 422, 'Image files cannot be stored permanently on the free serverless demo. Enter external HTTPS image URLs instead.');
  if (!/^[0-9a-f]{24}$/i.test(req.params.id)) return apiError(res, 404, 'Product not found');
  const original = await Product.findById(req.params.id);
  if (!original) return apiError(res, 404, 'Product not found');
  const normalized = normalize(req.body, req.files);
  if (req.body.images === undefined && !req.files?.length) normalized.images = original.images;
  const parsed = schema.safeParse({ ...original.toObject(), ...normalized });
  if (!parsed.success) return apiError(res, 400, parsed.error.issues.map(x=>x.message).join(', '));
  const product = await Product.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  res.json({ product });
}));
router.delete('/:id', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  if (!/^[0-9a-f]{24}$/i.test(req.params.id)) return apiError(res, 404, 'Product not found');
  const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!product) return apiError(res, 404, 'Product not found');
  res.json({ message: 'Product hidden from the store' });
}));
export default router;
