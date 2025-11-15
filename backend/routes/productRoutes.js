// backend/routes/productRoutes.js
import express from 'express';
import {
  getProducts,
  getProductById,
  createReview
} from '../controllers/productController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all products (with filters & search)
router.get('/', getProducts);

// GET single product
router.get('/:id', getProductById);

// POST review — protected route
router.post('/:id/reviews', protect, createReview);

export default router;
