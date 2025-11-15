import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Address sub-schema
const addressSchema = new mongoose.Schema({
  fullName: { type: String },
  address: { type: String },
  city: { type: String },
  postalCode: { type: String },
  country: { type: String, default: 'India' },
  phone: { type: String },
  primary: { type: Boolean, default: false }
}, { _id: false });

// Saved payment method
const paymentSchema = new mongoose.Schema({
  method: { type: String },       // "COD", "Card", "Razorpay", etc
  details: { type: Object }       // optional token / masked last4
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true, minlength: 6 },

    // New fields for checkout flow:
    addresses: {
      type: [addressSchema],
      default: []
    },

    savedPayment: {
      type: paymentSchema,
      default: { method: 'COD', details: {} }
    }
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password match
userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model('User', userSchema);
