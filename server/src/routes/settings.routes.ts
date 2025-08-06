import express from 'express';
import { verifyToken, isAdmin } from '../middleware/auth';
import settingsController from '../controllers/settings.controller';

const router = express.Router();

// Public route - no auth required
router.get('/signupEnabled', settingsController.getSignupEnabled);

// Admin routes - require admin authentication
router.use(verifyToken);
router.use(isAdmin);

// Get all settings 
router.get('/', settingsController.getSettings);

// Get a specific setting by key
router.get('/:key', settingsController.getSetting);

// Update a setting
router.put('/:key', settingsController.updateSetting);

export default router;
