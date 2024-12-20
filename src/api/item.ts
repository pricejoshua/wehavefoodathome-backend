import { product } from '../types/db'
import express from 'express';
import { getProducts, createProduct, getProduct, updateProduct, deleteProduct } from '../controllers/product';
const router = express.Router();
