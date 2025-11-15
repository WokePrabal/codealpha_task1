import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  brand: { type: String },
  category: { type: String },
  description: { type: String },
  price: { type: Number, required: true, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },

  // reviews
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 }, // average
  numReviews: { type: Number, required: true, default: 0 }

}, { timestamps: true });

export default mongoose.model('Product', productSchema);
