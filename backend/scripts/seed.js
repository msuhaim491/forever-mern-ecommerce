import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import mongoose from 'mongoose';
const photos = [
  'photo-1434389677669-e08b4cac3105','photo-1539109136881-3be0616acf4b','photo-1483985988355-763728e1935b',
  'photo-1521572163474-6864f9cf17ab','photo-1503342217505-b0a15ec3261c','photo-1509631179647-0177331693ae',
  'photo-1543076447-215ad9ba6923','photo-1525507119028-ed4c629a60a3','photo-1515886657613-9f3515b0c78f',
  'photo-1562157873-818bc0726f68','photo-1582142306909-195724d33ffc','photo-1605518216938-7c31b7b14ad0',
  'photo-1516762689617-e1cffcef479d','photo-1529139574466-a303027c1d8b','photo-1598032895397-b9472444bf93',
  'photo-1591047139829-d91aecb6caea','photo-1503341504253-dff4815485f1','photo-1523381210434-271e8be1f52b'
];
const img = (index) => `https://images.unsplash.com/${photos[index]}?auto=format&fit=crop&w=900&q=85`;
const rows = [
  ['Women Round Neck Cotton Top',24,'Women','Topwear',['S','M','L','XL']],
  ['Men Classic Relaxed Shirt',35,'Men','Topwear',['S','M','L','XL','XXL']],
  ['Women Oversized Weekend Tee',28,'Women','Topwear',['S','M','L','XL']],
  ['Men Essential Cotton T-shirt',22,'Men','Topwear',['S','M','L','XL']],
  ['Women Ribbed Everyday Top',32,'Women','Topwear',['S','M','L']],
  ['Women Summer Midi Dress',48,'Women','Topwear',['S','M','L','XL']],
  ['Kids Everyday Backpack Set',29,'Kids','Topwear',['4Y','6Y','8Y','10Y']],
  ['Women Modern Casual Set',59,'Women','Bottomwear',['S','M','L']],
  ['Women Wide Leg Trousers',39,'Women','Bottomwear',['S','M','L','XL']],
  ['Men Premium Everyday Polo',37,'Men','Topwear',['S','M','L','XL']],
  ['Men Tailored Casual Jacket',79,'Men','Winterwear',['M','L','XL','XXL']],
  ['Women Contemporary Blazer',85,'Women','Winterwear',['S','M','L']],
  ['Women Lightweight Knit Sweater',49,'Women','Winterwear',['S','M','L','XL']],
  ['Women Minimalist Fashion Dress',64,'Women','Topwear',['S','M','L']],
  ['Men Straight Fit Denim Jeans',54,'Men','Bottomwear',['30','32','34','36']],
  ['Men Warm Winter Jacket',99,'Men','Winterwear',['S','M','L','XL']],
  ['Women Soft Cotton Blouse',42,'Women','Topwear',['S','M','L','XL']],
  ['Kids Soft Everyday T-shirt',19,'Kids','Topwear',['4Y','6Y','8Y','10Y']]
];
try {
  await connectDb();
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.startsWith('REPLACE_') || process.env.ADMIN_PASSWORD.length < 12) throw new Error('Set ADMIN_EMAIL and a strong ADMIN_PASSWORD (12+ chars) in backend/.env');
  const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const existing = await User.findOne({email});
  if (!existing) await User.create({name:'Store Administrator',email,role:'admin',passwordHash:await bcrypt.hash(process.env.ADMIN_PASSWORD,12)});
  else if (existing.role !== 'admin') throw new Error('ADMIN_EMAIL already belongs to a customer. Choose a different email.');
  const count = await Product.countDocuments();
  if (count === 0) await Product.insertMany(rows.map(([name,price,category,subCategory,sizes], i)=>({ name,price,category,subCategory,sizes,images:[img(i)],description:`Discover the ${name.toLowerCase()}, thoughtfully crafted for comfort, modern styling and everyday wear. Quality fabrics and easy care.`,bestseller:i<8,active:true })));
  console.log(`Seed complete. Products: ${await Product.countDocuments()}. Admin: ${email}. No sample passwords are embedded in the code.`);
} catch(e) { console.error(e.message); process.exitCode=1; } finally { await mongoose.disconnect(); }
