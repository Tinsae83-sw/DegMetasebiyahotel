import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

declare global {
  var io: any;
}

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, paymentStatus } = req.query;

    const where: any = {};
    if (status) where.status = Array.isArray(status) ? status[0] : status;
    if (paymentStatus) where.paymentStatus = Array.isArray(paymentStatus) ? paymentStatus[0] : paymentStatus;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        table: true,
        waiter: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { menuItem: true } },
        table: true,
        waiter: { select: { id: true, name: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableNumber, tableId, items, notes, customerId } = req.body;
    const waiterId = req.body.waiterId || req.user?.userId;

    console.log('Creating order with data:', {
      tableNumber,
      tableId,
      items: items?.length,
      waiterId,
      customerId,
    });

    const finalTableId = tableId && tableId !== "" ? tableId : null;
    const finalWaiterId = waiterId && waiterId !== "" ? waiterId : null;
    const finalCustomerId = customerId && customerId !== "" ? customerId : null;

    const menuItemIds = items.map((item: any) => item.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });

    if (menuItems.length === 0) {
      return res.status(404).json({ error: 'No menu items found for the provided IDs' });
    }

    const orderItems = items.map((item: any) => {
      const menuItem = menuItems.find((mi: any) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name || '',
        quantity: item.quantity,
        price: menuItem.price || 0,
        notes: item.notes || '',
      };
    });

    const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        tableNumber,
        tableId: finalTableId,
        items: { create: orderItems },
        waiterId: finalWaiterId,
        customerId: finalCustomerId,
        notes,
        subtotal,
        tax,
        total,
      },
      include: {
        items: { include: { menuItem: true } },
        table: true,
        waiter: { select: { id: true, name: true } },
      },
    });

    console.log('Order created successfully:', order.id);

    // Emit real-time event to kitchen and waiters
    if (global.io) {
      global.io.to('kitchen').emit('order-created', order);
      global.io.to('waiter').emit('order-created', order);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const data = req.body;
    const order = await prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        items: true,
        table: true,
        waiter: { select: { id: true, name: true } },
      },
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    await prisma.order.delete({
      where: { id: orderId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: { include: { menuItem: true } },
        table: true,
        waiter: { select: { id: true, name: true } },
      },
    });

    // Emit real-time event
    if (global.io) {
      global.io.to('kitchen').emit('order-status-updated', order);
      global.io.to('waiter').emit('order-status-updated', order);
      if (status === 'READY') {
        global.io.to('waiter').emit('order-ready', order);
        global.io.to('cashiers').emit('order-ready', order);
      }
      if (status === 'SERVED') {
        global.io.to('waiter').emit('order-served', order);
        global.io.emit('order-awaiting-confirmation', {
          orderId: order.id,
          tableNumber: order.tableNumber,
          message: `Order for Table ${order.tableNumber} is served - awaiting delivery confirmation`
        });
      }
      if (status === 'COMPLETED') {
        global.io.to('waiter').emit('order-completed', order);
        global.io.emit('order-delivery-confirmed', {
          orderId: order.id,
          tableNumber: order.tableNumber,
          message: `Order for Table ${order.tableNumber} delivery confirmed`
        });
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const { paymentMethod, amount, cashReceived } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        paymentStatus: 'PAID',
        discount: cashReceived && paymentMethod === 'CASH' ? cashReceived - amount : 0,
      },
      include: {
        items: true,
        table: true,
        waiter: { select: { id: true, name: true } },
      },
    });

    // Emit real-time event
    if (global.io) {
      global.io.to('waiters').emit('payment-completed', order);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderId = Array.isArray(id) ? id[0] : id;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        table: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      receiptUrl: `https://your-restaurant.com/receipt/${orderId}`,
    });
  } catch (error) {
    next(error);
  }
};
