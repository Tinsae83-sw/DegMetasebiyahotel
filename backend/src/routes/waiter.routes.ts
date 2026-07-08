import { Router } from 'express';
import {
  getWaiterStats,
  getWaiterPerformance,
} from '../controllers/waiter.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, authorize('WAITER', 'ADMIN'), getWaiterStats);
router.get('/performance', authenticate, authorize('WAITER', 'ADMIN'), getWaiterPerformance);

export default router;
