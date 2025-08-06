import { Router } from 'express';
import * as payoutController from '../controllers/payout.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { createPayoutValidator, approveRejectPayoutValidator } from '../validators/payout.validator';
import { UserRole } from '../config/constants';

const router = Router();

/**
 * @route   POST /api/payouts
 * @desc    Request a payout
 * @access  Private (Artist)
 */
router.post(
  '/',
  protect,
  authorize([UserRole.ARTIST]),
  validate(createPayoutValidator),
  payoutController.requestPayout
);

/**
 * @route   GET /api/payouts
 * @desc    Get all payouts
 * @access  Private
 */
router.get(
  '/',
  protect,
  payoutController.getPayouts
);

/**
 * @route   GET /api/payouts/balance
 * @desc    Get artist's balance
 * @access  Private
 */
router.get(
  '/balance',
  protect,
  payoutController.getBalance
);

/**
 * @route   GET /api/payouts/:id
 * @desc    Get payout by ID
 * @access  Private
 */
router.get(
  '/:id',
  protect,
  payoutController.getPayoutById
);

/**
 * @route   PUT /api/payouts/:id/status
 * @desc    Approve or reject payout
 * @access  Private (Admin)
 */
router.put(
  '/:id/status',
  protect,
  authorize([UserRole.ADMIN]),
  validate(approveRejectPayoutValidator),
  payoutController.updatePayoutStatus
);

export default router; 