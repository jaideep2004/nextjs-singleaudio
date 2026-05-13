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

router.post('/signup/start', validate(registerValidator), authController.startSignup);
router.post('/signup/verify', authController.verifySignup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginValidator), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route   PUT /api/auth/me/kyc
 * @desc    Submit current user's KYC/onboarding data
 * @access  Private
 */
router.put('/me/kyc', protect, uploadRegistrationFiles, authController.submitKyc);

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
