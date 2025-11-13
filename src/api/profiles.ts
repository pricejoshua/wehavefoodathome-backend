import express from 'express';
import {
    getProfile,
    getProfileByUsername,
    createProfile,
    updateProfile,
    deleteProfile,
    searchProfiles
} from '../controllers/profile';
import { check_token } from '../middleware/auth';

const router = express.Router();

// POST /api/v1/profiles - Create a new profile (public for registration)
router.post('/', createProfile);

// Apply authentication to all other profile routes
router.use(check_token);

// GET /api/v1/profiles/search?query=xxx - Search profiles (protected)
router.get('/search', searchProfiles);

// GET /api/v1/profiles/username/:username - Get profile by username (protected)
router.get('/username/:username', getProfileByUsername);

// GET /api/v1/profiles/:id - Get profile by ID (protected)
router.get('/:id', getProfile);

// PUT /api/v1/profiles/:id - Update a profile (protected)
router.put('/:id', updateProfile);

// DELETE /api/v1/profiles/:id - Delete a profile (protected)
router.delete('/:id', deleteProfile);

export default router;
