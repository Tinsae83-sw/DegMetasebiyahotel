import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  uploadLogo,
  uploadCoverImage,
} from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, authorize('ADMIN'), updateSettings);
router.post('/logo', authenticate, authorize('ADMIN'), uploadLogo);
router.post('/cover', authenticate, authorize('ADMIN'), uploadCoverImage);

export default router;
