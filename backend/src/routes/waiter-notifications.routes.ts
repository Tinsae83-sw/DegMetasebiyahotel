import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getWaiterNotifications, markAllWaiterNotificationsRead, markWaiterNotificationRead } from '../utils/waiter-notifications.js';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json(getWaiterNotifications(req.user?.userId));
});

router.patch('/:id/read', authenticate, (req, res) => {
  const notification = markWaiterNotificationRead(req.params.id, req.user?.userId);
  res.json({ success: true, notification });
});

router.patch('/read-all', authenticate, (req, res) => {
  markAllWaiterNotificationsRead(req.user?.userId);
  res.json({ success: true });
});

export default router;
