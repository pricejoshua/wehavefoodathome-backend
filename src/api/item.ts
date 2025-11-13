import type { Tables } from '../types/db.types'
import express from 'express';
import {
    getProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    searchByBarcode,
    searchProducts
} from '../controllers/product';

const router = express.Router();

router.get<{}, Tables<'products'>[]>('/', getProducts);
router.get('/search', searchProducts);
router.get('/barcode/:barcode', searchByBarcode);
router.post<{}, Tables<'products'>[]>('/', createProduct);
router.get<{ id: string }, Tables<'products'>>('/:id', getProduct);
router.put<{ id: string }, Tables<'products'>>('/:id', updateProduct);
router.delete<{ id: string }>('/:id', deleteProduct);

export default router;