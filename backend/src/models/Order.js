import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, size: String, quantity: Number, price: Number }],
  address: {
    firstName: String, lastName: String, email: String, phone: String,
    street: String, city: String, state: String, zipcode: String, country: String
  },
  subtotal: Number, deliveryFee: Number, total: Number,
  paymentMethod: { type: String, enum: ['COD', 'Stripe'], required: true },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  status: { type: String, enum: ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'], default: 'Order Placed' },
  stripeSessionId: { type: String, sparse: true, unique: true },
  paidAt: Date
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
