import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getOrderHistory,
  addLoyaltyPoints,
} from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { customerSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, getAllCustomers);
router.get('/:id', authenticate, getCustomerById);
router.post('/', authenticate, authorize('ADMIN'), validate(customerSchema), createCustomer);
router.put('/:id', authenticate, authorize('ADMIN'), validate(customerSchema), updateCustomer);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCustomer);
router.get('/:id/orders', authenticate, getOrderHistory);
router.post('/:id/loyalty', authenticate, authorize('ADMIN'), addLoyaltyPoints);

export default router;
