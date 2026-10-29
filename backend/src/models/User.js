import mongoose from 'mongoose';
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  size: { type: String, required: true }, quantity: { type: Number, min: 1, max: 30, default: 1 }
}, { _id: false });
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  cart: { type: [cartItemSchema], default: [] }
}, { timestamps: true });
export default mongoose.model('User', userSchema);
