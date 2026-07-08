import { Router } from 'express';
import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  generateQR,
  toggleActive,
  callWaiter,
  requestBill,
  assignWaiter,
  removeWaiter,
} from '../controllers/table.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { tableSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, getAllTables);
router.get('/:id', authenticate, getTableById);
router.post('/', authenticate, authorize('ADMIN'), validate(tableSchema), createTable);
router.put('/:id', authenticate, authorize('ADMIN'), validate(tableSchema), updateTable);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTable);
router.post('/:id/generate-qr', authenticate, authorize('ADMIN'), generateQR);
router.patch('/:id/active', authenticate, authorize('ADMIN'), toggleActive);
router.post('/:id/call-waiter', callWaiter);
router.post('/:id/request-bill', requestBill);
router.post('/:id/assign-waiter', authenticate, authorize('ADMIN'), assignWaiter);
router.delete('/:id/waiter', authenticate, authorize('ADMIN'), removeWaiter);

export default router;
