import type { Tables } from '../types/db.types';
import express from 'express';
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  searchByBarcode,
  searchProducts,
  lookupAndCreateFromBarcode,
} from '../controllers/product';
import { check_token } from '../middleware/auth';

const router = express.Router();

// Public routes - no authentication required
router.get<{}, Tables<'products'>[]>('/', getProducts);
router.get('/search', searchProducts);
router.get('/barcode/:barcode', searchByBarcode);
router.post('/barcode/:barcode/lookup', lookupAndCreateFromBarcode);
router.post<{}, Tables<'products'>[]>('/', createProduct);
router.get<{ id: string }, Tables<'products'>>('/:id', getProduct);

// Protected routes - authentication required
router.put<{ id: string }, Tables<'products'>>('/:id', check_token, updateProduct);
router.delete<{ id: string }>('/:id', check_token, deleteProduct);

export default router;