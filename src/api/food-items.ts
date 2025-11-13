import express from 'express';
import {
    getFoodItems,
    getFoodItem,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    searchFoodItems
} from '../controllers/foodItem';

const router = express.Router();

// GET /api/v1/food-items?house_id=xxx - Get all food items for a house
router.get('/', getFoodItems);

// GET /api/v1/food-items/search?house_id=xxx&query=xxx - Search food items
router.get('/search', searchFoodItems);

// GET /api/v1/food-items/:id - Get a single food item
router.get('/:id', getFoodItem);

// POST /api/v1/food-items - Add a food item to a house
router.post('/', createFoodItem);

// PUT /api/v1/food-items/:id - Update a food item
router.put('/:id', updateFoodItem);

// DELETE /api/v1/food-items/:id - Delete a food item
router.delete('/:id', deleteFoodItem);

export default router;
