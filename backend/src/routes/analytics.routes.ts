import { Router } from 'express';
import {
  getDashboardStats,
  getSalesData,
  getTopSellingItems,
  getCategoryPerformance,
  getPeakHours,
  getPaymentMethods,
  getSalesByPeriod,
  generateReport,
  getStaffPerformance,
  getMenuPerformance,
} from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/sales', authenticate, authorize('ADMIN'), getSalesData);
router.get('/sales-by-period', authenticate, authorize('ADMIN'), getSalesByPeriod);
router.get('/top-items', authenticate, authorize('ADMIN'), getTopSellingItems);
router.get('/categories', authenticate, authorize('ADMIN'), getCategoryPerformance);
router.get('/peak-hours', authenticate, authorize('ADMIN'), getPeakHours);
router.get('/payments', authenticate, authorize('ADMIN'), getPaymentMethods);
router.post('/reports', authenticate, authorize('ADMIN'), generateReport);
router.get('/staff-performance', authenticate, authorize('ADMIN'), getStaffPerformance);
router.get('/menu-performance', authenticate, authorize('ADMIN'), getMenuPerformance);

export default router;
