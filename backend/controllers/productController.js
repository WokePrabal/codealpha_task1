import Product from '../models/Product.js';
import Wishlist from '../models/Wishlist.js';
import mongoose from 'mongoose';

// GET /api/products?search=&category=&min=&max=&sort=price_asc|price_desc|newest|rating_desc&rating=4&inStock=true
export const getProducts = async (req, res) => {
  try {
    const { search, category, min, max, page = 1, limit = 50, sort, rating, inStock, brand } = req.query;
    const filter = {};

    if (search) {
      const escaped = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = [{ name: regex }, { brand: regex }, { category: regex }, { description: regex }];
    }
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (rating) filter.rating = { $gte: Number(rating) };
    if (inStock === 'true') filter.countInStock = { $gt: 0 };
    if (min || max) {
      filter.price = {};
      if (min) filter.price.$gte = Number(min);
      if (max) filter.price.$lte = Number(max);
    }

    // sorting
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating_desc') sortObj = { rating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit || 50);
    const products = await Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit));
    return res.json(products);
  } catch (err) {
    console.error('getProducts error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    console.error('getProductById err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products/:id/reviews
// body: { rating, comment }
export const createReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // ensure user hasn't reviewed
    const already = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'You have already reviewed this product' });

    const { rating, comment } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment || ''
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
    await product.save();
    return res.status(201).json({ message: 'Review added' });
  } catch (err) {
    console.error('createReview err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id/reviews
export const getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('reviews');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product.reviews);
  } catch (err) {
    console.error('getReviews err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// WISHLIST endpoints
// POST /api/wishlist (body: { product }) -> add product to user's wishlist
export const addToWishlist = async (req, res) => {
  try {
    const productId = req.body.product;
    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).json({ message: 'Invalid product id' });
    let wish = await Wishlist.findOne({ user: req.user._id });
    if (!wish) {
      wish = await Wishlist.create({ user: req.user._id, items: [{ product: productId }] });
      return res.status(201).json(wish);
    }
    if (wish.items.find(i => i.product.toString() === productId)) {
      return res.status(200).json({ message: 'Already in wishlist' });
    }
    wish.items.push({ product: productId });
    await wish.save();
    return res.json(wish);
  } catch (err) {
    console.error('addToWishlist err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const wish = await Wishlist.findOne({ user: req.user._id });
    if (!wish) return res.status(404).json({ message: 'Wishlist not found' });
    wish.items = wish.items.filter(i => i.product.toString() !== productId);
    await wish.save();
    return res.json(wish);
  } catch (err) {
    console.error('removeFromWishlist err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    const wish = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    return res.json(wish ? wish.items : []);
  } catch (err) {
    console.error('getWishlist err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/wishlist/move-to-cart  { productId }
export const wishlistMoveToCart = async (req, res) => {
  try {
    // This endpoint will return the product object for frontend to add to cart
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // remove from wishlist if exists
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { product: product._id } } });

    return res.json({ product });
  } catch (err) {
    console.error('wishlistMoveToCart err', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
