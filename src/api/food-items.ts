import express from 'express';
import {
    getFoodItems,
    getFoodItem,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    searchFoodItems,
    getExpiringItems,
    bulkCreateFoodItems
} from '../controllers/foodItem';
import {
    getFoodItemHistory,
    getHouseActivity,
    getHouseActivitySummary
} from '../controllers/foodLog';
import { check_token } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all food-items routes
router.use(check_token);

// GET /api/v1/food-items?house_id=xxx - Get all food items for a house
router.get('/', getFoodItems);

// GET /api/v1/food-items/search?house_id=xxx&query=xxx - Search food items
router.get('/search', searchFoodItems);

// GET /api/v1/food-items/expiring?house_id=xxx&days=7 - Get expiring items
router.get('/expiring', getExpiringItems);

// GET /api/v1/food-items/activity?house_id=xxx - Get house activity log
router.get('/activity', getHouseActivity);

// GET /api/v1/food-items/activity/summary?house_id=xxx&days=30 - Get activity summary
router.get('/activity/summary', getHouseActivitySummary);

// POST /api/v1/food-items/bulk - Bulk create food items
router.post('/bulk', bulkCreateFoodItems);

// GET /api/v1/food-items/:id - Get a single food item
router.get('/:id', getFoodItem);

// GET /api/v1/food-items/:id/history - Get food item history
router.get('/:id/history', getFoodItemHistory);

// POST /api/v1/food-items - Add a food item to a house
router.post('/', createFoodItem);

// PUT /api/v1/food-items/:id - Update a food item
router.put('/:id', updateFoodItem);

// DELETE /api/v1/food-items/:id - Delete a food item
router.delete('/:id', deleteFoodItem);

export default router;
