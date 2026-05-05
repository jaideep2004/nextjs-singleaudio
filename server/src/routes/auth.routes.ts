import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} from '../validators/auth.validator';
import { uploadRegistrationFiles } from '../utils/fileUpload';

const router = Router();

/**
 * @route   GET /api/auth/check-artist-name
 * @desc    Check if an artist name is available
 * @access  Public
 */
router.get('/check-artist-name', authController.checkArtistName);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  uploadRegistrationFiles,
  validate(registerValidator),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginValidator), authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Update user profile
 * @access  Private
 */
router.put('/me', protect, validate(updateProfileValidator), authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/change-password',
  protect,
  validate(changePasswordValidator),
  authController.changePassword
);

export default router;
