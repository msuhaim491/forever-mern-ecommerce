import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, required: true, maxlength: 4000 },
  price: { type: Number, required: true, min: 0.5, max: 100000 },
  images: { type: [String], required: true, validate: v => v.length > 0 },
  category: { type: String, enum: ['Men', 'Women', 'Kids'], required: true },
  subCategory: { type: String, enum: ['Topwear', 'Bottomwear', 'Winterwear'], required: true },
  sizes: { type: [String], required: true },
  bestseller: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text' });
export default mongoose.model('Product', productSchema);
