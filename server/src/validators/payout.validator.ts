import { body, param } from 'express-validator';
import { PaymentMethod, PayoutStatus } from '../config/constants';

export const createPayoutValidator = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => {
      const amount = parseFloat(value);
      if (amount < 5) {
        throw new Error('Minimum payout amount is 5');
      }
      return true;
    }),
    
  body('currency')
    .trim()
    .notEmpty()
    .withMessage('Currency is required')
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY'])
    .withMessage('Currency must be one of: USD, EUR, GBP, INR, JPY'),
    
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Object.values(PaymentMethod))
    .withMessage(`Payment method must be one of: ${Object.values(PaymentMethod).join(', ')}`),
    
  body('paymentDetails.upiId')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === PaymentMethod.UPI && (!value || value.trim() === '')) {
        throw new Error('UPI ID is required when payment method is UPI');
      }
      return true;
    }),
    
  body('paymentDetails.paypalEmail')
    .custom((value, { req }) => {
      if (req.body.paymentMethod === PaymentMethod.PAYPAL && (!value || value.trim() === '')) {
        throw new Error('PayPal email is required when payment method is PayPal');
      }
      if (req.body.paymentMethod === PaymentMethod.PAYPAL && value) {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Please provide a valid PayPal email');
        }
      }
      return true;
    })
];

export const approveRejectPayoutValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid payout ID'),
    
  body('status')
    .isIn([PayoutStatus.APPROVED, PayoutStatus.REJECTED])
    .withMessage('Status must be either approved or rejected'),
    
  body('rejectionReason')
    .custom((value, { req }) => {
      if (req.body.status === PayoutStatus.REJECTED && (!value || value.trim() === '')) {
        throw new Error('Rejection reason is required when rejecting a payout');
      }
      return true;
    })
]; 