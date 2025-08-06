import { Router } from 'express';
import authRoutes from './auth.routes';
import trackRoutes from './track.routes';
import royaltyRoutes from './royalty.routes';
import payoutRoutes from './payout.routes';
import notificationRoutes from './notification.routes';
import userRoutes from './user.routes';
import settingsRoutes from './settings.routes';
import audioRoutes from './audio';
import { API_PREFIX } from '../config/constants';
import territoryRoutes from './territory.routes';
import rightsRoutes from './rights.routes';

const router = Router();

// Register all routes
router.use(`${API_PREFIX}/audio`, audioRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/tracks`, trackRoutes);
router.use(`${API_PREFIX}/royalties`, royaltyRoutes);
router.use(`${API_PREFIX}/payouts`, payoutRoutes);
router.use(`${API_PREFIX}/notifications`, notificationRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/settings`, settingsRoutes);
router.use(`${API_PREFIX}/territory`, territoryRoutes);
router.use(`${API_PREFIX}/rights`, rightsRoutes);

export default router;