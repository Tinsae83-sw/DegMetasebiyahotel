import { Router } from 'express';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleActive,
  resetPassword,
} from '../controllers/staff.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { staffSchema, updateStaffSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, getAllStaff);
router.get('/:id', authenticate, getStaffById);
router.post('/', authenticate, authorize('ADMIN'), validate(staffSchema), createStaff);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateStaffSchema), updateStaff);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteStaff);
router.patch('/:id/active', authenticate, authorize('ADMIN'), toggleActive);
router.post('/:id/reset-password', authenticate, authorize('ADMIN'), resetPassword);

export default router;
