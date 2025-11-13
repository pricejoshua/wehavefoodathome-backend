import express from 'express';
import {
    getProfile,
    getProfileByUsername,
    createProfile,
    updateProfile,
    deleteProfile,
    searchProfiles
} from '../controllers/profile';

const router = express.Router();

// GET /api/v1/profiles/search?query=xxx - Search profiles
router.get('/search', searchProfiles);

// GET /api/v1/profiles/username/:username - Get profile by username
router.get('/username/:username', getProfileByUsername);

// GET /api/v1/profiles/:id - Get profile by ID
router.get('/:id', getProfile);

// POST /api/v1/profiles - Create a new profile
router.post('/', createProfile);

// PUT /api/v1/profiles/:id - Update a profile
router.put('/:id', updateProfile);

// DELETE /api/v1/profiles/:id - Delete a profile
router.delete('/:id', deleteProfile);

export default router;
