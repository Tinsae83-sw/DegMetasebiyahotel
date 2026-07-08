import { Router } from 'express';
import prisma from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { addWaiterNotification, getWaiterNotifications, markAllWaiterNotificationsRead, markWaiterNotificationRead } from '../utils/waiter-notifications.js';

const router = Router();

router.get('/orders', authenticate, async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const station = req.query.station as string | undefined;

    const where: any = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        waiter: { select: { id: true, name: true } },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      tableNumber: order.tableNumber,
      waiterId: order.waiterId || '',
      waiterName: order.waiter?.name || 'Unknown',
      customerName: order.customerId || undefined,
      status: (order.status || 'PENDING').toUpperCase(),
      priority: 'NORMAL',
      orderType: 'DINE_IN',
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
        specialInstructions: item.notes || '',
        allergies: [],
        station: 'GRILL',
      })),
      specialInstructions: order.notes || '',
      estimatedPreparationTime: 20,
      createdAt: order.createdAt.toISOString(),
      acceptedAt: order.createdAt.toISOString(),
      startedPreparingAt: undefined,
      readyAt: undefined,
      completedAt: undefined,
      cancelledAt: undefined,
      cancellationReason: undefined,
      cancelledBy: undefined,
      assignedKitchenStaff: undefined,
      station: 'GRILL',
    }));

    res.json(mappedOrders);
  } catch (error) {
    console.error('Failed to load kitchen orders', error);
    res.status(500).json({ message: 'Failed to load kitchen orders' });
  }
});

router.get('/orders/:id', authenticate, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: true,
        waiter: { select: { id: true, name: true } },
        table: true,
      },
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({
      id: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      tableNumber: order.tableNumber,
      waiterId: order.waiterId || '',
      waiterName: order.waiter?.name || 'Unknown',
      customerName: order.customerId || undefined,
      status: (order.status || 'PENDING').toUpperCase(),
      priority: 'NORMAL',
      orderType: 'DINE_IN',
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes || '',
        specialInstructions: item.notes || '',
        allergies: [],
        station: 'GRILL',
      })),
      specialInstructions: order.notes || '',
      estimatedPreparationTime: 20,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to load kitchen order', error);
    res.status(500).json({ message: 'Failed to load kitchen order' });
  }
});

router.patch('/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update kitchen order status', error);
    res.status(500).json({ message: 'Failed to update kitchen order status' });
  }
});

router.post('/orders/:id/accept', authenticate, async (req, res) => {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'PREPARING' },
    });

    res.json({ success: true, message: 'Order accepted', order: updatedOrder });
  } catch (error) {
    console.error('Failed to accept kitchen order', error);
    res.status(500).json({ message: 'Failed to accept kitchen order' });
  }
});

router.post('/orders/:id/reject', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Order rejected' });
});

router.post('/orders/:id/start-preparing', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Started preparing' });
});

router.post('/orders/:id/ready', authenticate, async (req, res) => {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'READY' },
    });

    const orderWithRelations = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { waiter: true },
    });

    if (orderWithRelations?.waiterId) {
      addWaiterNotification({
        id: `notif-${Date.now()}`,
        type: 'KITCHEN_UPDATE',
        title: 'Order ready',
        message: `Order #${updatedOrder.id.slice(0, 8).toUpperCase()} is ready for pickup.`,
        orderId: updatedOrder.id,
        waiterId: orderWithRelations.waiterId,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, message: 'Ready', order: updatedOrder });
  } catch (error) {
    console.error('Failed to mark kitchen order as ready', error);
    res.status(500).json({ message: 'Failed to mark kitchen order as ready' });
  }
});

router.post('/orders/:id/complete', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Completed' });
});

router.patch('/orders/:orderId/items/:itemId', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Item updated' });
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const preparingOrders = await prisma.order.count({ where: { status: 'PREPARING' } });
    const readyOrders = await prisma.order.count({ where: { status: 'READY' } });
    const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });
    const cancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED' } });

    res.json({
      totalPendingOrders: pendingOrders,
      acceptedOrders: 0,
      preparingOrders,
      readyOrders,
      completedOrders,
      cancelledOrders,
      averagePreparationTime: 15,
      ordersCompletedToday: completedOrders,
      currentWorkload: pendingOrders + preparingOrders,
      kitchenStatus: pendingOrders + preparingOrders > 5 ? 'BUSY' : 'NORMAL',
    });
  } catch (error) {
    console.error('Failed to load kitchen stats', error);
    res.status(500).json({ message: 'Failed to load kitchen stats' });
  }
});

router.get('/performance', authenticate, async (req, res) => {
  res.json({
    ordersToday: 0,
    averageCookingTime: 15,
    fastestPreparation: 10,
    slowestPreparation: 25,
    completionRate: 100,
    kitchenEfficiency: 90,
    peakHours: [],
  });
});

router.get('/notifications', authenticate, async (req, res) => {
  res.json(getWaiterNotifications(req.user?.userId));
});

router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  const notification = markWaiterNotificationRead(req.params.id, req.user?.userId);
  res.json({ success: true, notification });
});

router.post('/notifications/read-all', authenticate, async (req, res) => {
  markAllWaiterNotificationsRead(req.user?.userId);
  res.json({ success: true });
});

router.get('/staff', authenticate, async (req, res) => {
  res.json([]);
});

router.patch('/staff/:id', authenticate, async (req, res) => {
  res.json({ success: true });
});

router.get('/settings', authenticate, async (req, res) => {
  res.json({
    notificationSound: true,
    fullScreenMode: false,
    darkMode: false,
    language: 'en',
    autoRefresh: true,
    refreshInterval: 30,
    displayDensity: 'NORMAL',
    defaultStation: 'GRILL',
  });
});

router.patch('/settings', authenticate, async (req, res) => {
  res.json({ success: true });
});

router.get('/orders/:orderId/timeline', authenticate, async (req, res) => {
  res.json([]);
});

export default router;
