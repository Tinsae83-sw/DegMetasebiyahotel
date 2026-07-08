import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateStatus,
  processPayment,
  getReceipt,
} from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { orderSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, getAllOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/', authenticate, validate(orderSchema), createOrder);
router.put('/:id', authenticate, updateOrder);
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), deleteOrder);
router.patch('/:id/status', authenticate, updateStatus);
router.post('/:id/payment', authenticate, processPayment);
router.get('/:id/receipt', authenticate, getReceipt);

export default router;
