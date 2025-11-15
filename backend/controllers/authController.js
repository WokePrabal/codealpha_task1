import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
};

export const profile = async (req, res) => {
  res.json(req.user);
};

export const saveAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404);
    user.addresses = user.addresses || [];
    // mark as primary
    user.addresses.unshift({ ...req.body.shipping, primary: true });
    user.savedPayment = { method: req.body.paymentMethod, details: req.body.details || {} };
    await user.save();
    return res.json({ message: 'Saved' });
  } catch (err) { return res.status(500).json({ message: 'Server error' }); }
};
