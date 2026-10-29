import mongoose from 'mongoose';
export async function connectDb() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000 });
  console.log('MongoDB connected');
}
