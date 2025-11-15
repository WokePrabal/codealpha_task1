import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        image: String,
        price: Number,
        qty: Number
      }
    ],
    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: { type: String, default: 'COD' },
    itemsPrice: Number,
    shippingPrice: Number,
    totalPrice: Number,
    status: { type: String, default: 'pending' } // pending, paid, shipped, delivered
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);
