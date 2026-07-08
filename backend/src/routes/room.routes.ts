import { Router } from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleActive,
  generateQR,
  assignWaiter,
  removeWaiter,
} from '../controllers/room.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';
import { roomSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, getAllRooms);
router.get('/:id', authenticate, getRoomById);
router.post('/', authenticate, authorize('ADMIN'), validate(roomSchema), createRoom);
router.put('/:id', authenticate, authorize('ADMIN'), validate(roomSchema), updateRoom);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteRoom);
router.post('/:id/generate-qr', authenticate, authorize('ADMIN'), generateQR);
router.patch('/:id/active', authenticate, authorize('ADMIN'), toggleActive);
router.post('/:id/assign-waiter', authenticate, authorize('ADMIN'), assignWaiter);
router.delete('/:id/waiter', authenticate, authorize('ADMIN'), removeWaiter);

export default router;
