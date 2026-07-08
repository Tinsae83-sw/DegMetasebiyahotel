import { Router } from 'express';
import multer from 'multer';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  toggleFeatured,
} from '../controllers/menu.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { menuItemSchema } from '../utils/validation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authenticate, authorize('ADMIN'), upload.single('image'), createMenuItem);
router.put('/:id', authenticate, authorize('ADMIN'), upload.single('image'), updateMenuItem);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMenuItem);
router.patch('/:id/availability', authenticate, authorize('ADMIN'), toggleAvailability);
router.patch('/:id/featured', authenticate, authorize('ADMIN'), toggleFeatured);

export default router;
