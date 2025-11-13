import express from 'express';
import {
    getUserHouses,
    getHouse,
    getHouseMembers,
    createHouse,
    updateHouse,
    deleteHouse,
    addUserToHouse,
    removeUserFromHouse
} from '../controllers/house';

const router = express.Router();

// GET /api/v1/houses?user_id=xxx - Get all houses for a user
router.get('/', getUserHouses);

// POST /api/v1/houses - Create a new house
router.post('/', createHouse);

// GET /api/v1/houses/:id - Get a single house
router.get('/:id', getHouse);

// PUT /api/v1/houses/:id - Update a house
router.put('/:id', updateHouse);

// DELETE /api/v1/houses/:id - Delete a house
router.delete('/:id', deleteHouse);

// GET /api/v1/houses/:id/members - Get all members of a house
router.get('/:id/members', getHouseMembers);

// POST /api/v1/houses/members - Add a user to a house
router.post('/members', addUserToHouse);

// DELETE /api/v1/houses/members - Remove a user from a house
router.delete('/members', removeUserFromHouse);

export default router;
