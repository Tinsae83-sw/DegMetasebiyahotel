import { Router } from 'express';
import {
  getAllCustomerRequests,
  getCustomerRequestById,
  getCustomerRequestsByTable,
  createCustomerRequest,
  updateCustomerRequest,
  deleteCustomerRequest,
  createPublicCustomerRequest,
} from '../controllers/customer-request.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public endpoint for customers (no auth required)
router.post('/public', createPublicCustomerRequest);

// Protected endpoints for staff
router.get('/', authenticate, getAllCustomerRequests);
router.get('/table/:tableId', authenticate, getCustomerRequestsByTable);
router.get('/:id', authenticate, getCustomerRequestById);
router.post('/', authenticate, createCustomerRequest);
router.patch('/:id', authenticate, updateCustomerRequest);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCustomerRequest);

export default router;
