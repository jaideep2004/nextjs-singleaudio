import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get(
  '/',
  protect,
  authorize([UserRole.ADMIN]),
  userController.getUsers
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Private (Admin)
 */
router.post(
  '/',
  protect,
  authorize([UserRole.ADMIN]),
  userController.createUser
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin)
 */
router.get(
  '/stats',
  protect,
  authorize([UserRole.ADMIN]),
  userController.getUserStats
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  protect,
  authorize([UserRole.ADMIN]),
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  protect,
  authorize([UserRole.ADMIN]),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  protect,
  authorize([UserRole.ADMIN]),
  userController.deleteUser
);

export default router; 