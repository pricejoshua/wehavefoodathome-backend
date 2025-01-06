import type { Tables } from '../types/db.types'
import express from 'express';
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from '../controllers/product';
const router = express.Router();

router.get<{}, Tables<'products'>[]>('/', getProducts);