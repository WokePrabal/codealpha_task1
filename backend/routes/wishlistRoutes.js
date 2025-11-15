import express from 'express';
import { addToWishlist, removeFromWishlist, getWishlist, wishlistMoveToCart } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/', getWishlist);
router.post('/move-to-cart', wishlistMoveToCart);
export default router;
