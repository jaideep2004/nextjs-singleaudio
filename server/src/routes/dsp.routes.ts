import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.middleware';
import { UserRole } from '../config/constants';
import * as dspController from '../controllers/dsp.controller';

const router = Router();

router.get('/providers', protect, authorize([UserRole.ADMIN]), dspController.listProviders);
router.post('/providers', protect, authorize([UserRole.ADMIN]), dspController.registerProvider);
router.post('/providers/bootstrap-phase1', protect, authorize([UserRole.ADMIN]), dspController.bootstrapPhase1Providers);

router.get('/deliveries', protect, authorize([UserRole.ADMIN]), dspController.listDeliveries);
router.get('/deliveries/:jobId', protect, authorize([UserRole.ADMIN]), dspController.getDeliveryById);
router.post('/deliveries/dispatch', protect, authorize([UserRole.ADMIN]), dspController.dispatchDelivery);
router.post('/deliveries/:jobId/retry', protect, authorize([UserRole.ADMIN]), dspController.retryDelivery);

router.post('/rights/claims', protect, authorize([UserRole.ADMIN]), dspController.createRightsClaim);
router.post('/rights/fingerprint-matches', protect, authorize([UserRole.ADMIN]), dspController.addFingerprintMatch);

router.post('/webhooks/:providerKey', dspController.processWebhook);

export default router;
