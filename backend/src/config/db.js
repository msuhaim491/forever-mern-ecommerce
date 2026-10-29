import mongoose from 'mongoose';

let connectionPromise;
export async function connectDb() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 12000 })
      .then(() => console.log('MongoDB connected'))
      .catch(error => { connectionPromise = undefined; throw error; });
  }
  await connectionPromise;
}
