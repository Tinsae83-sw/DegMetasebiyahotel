import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { categorySchema } from '../utils/validation.js';

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize('ADMIN'), validate(categorySchema), createCategory);
router.put('/:id', authenticate, authorize('ADMIN'), validate(categorySchema), updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);
router.post('/reorder', authenticate, authorize('ADMIN'), reorderCategories);

export default router;
