import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getWaiterStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      completedOrders,
      totalRevenue,
      tablesServed,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          waiterId: userId,
          createdAt: { gte: today },
        },
      }),
      prisma.order.count({
        where: {
          waiterId: userId,
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
      }),
      prisma.order.aggregate({
        where: {
          waiterId: userId,
          paymentStatus: 'PAID',
          createdAt: { gte: today },
        },
        _sum: { total: true },
      }),
      prisma.order.findMany({
        where: {
          waiterId: userId,
          status: 'COMPLETED',
          createdAt: { gte: today },
        },
        select: { tableId: true },
      }).then(orders => new Set(orders.map(o => o.tableId)).size),
    ]);

    const activeOrders = await prisma.order.count({
      where: {
        waiterId: userId,
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
      },
    });

    // Calculate average service time (in minutes)
    const completedOrdersWithTimes = await prisma.order.findMany({
      where: {
        waiterId: userId,
        status: 'COMPLETED',
        createdAt: { gte: today },
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const averageServiceTime = completedOrdersWithTimes.length > 0
      ? completedOrdersWithTimes.reduce((sum, order) => {
          const diff = order.updatedAt.getTime() - order.createdAt.getTime();
          return sum + diff / (1000 * 60); // Convert to minutes
        }, 0) / completedOrdersWithTimes.length
      : 0;

    res.json({
      totalOrders,
      activeOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      tablesServed,
      averageServiceTime: Math.round(averageServiceTime),
    });
  } catch (error) {
    next(error);
  }
};

export const getWaiterPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { date } = req.query;
    
    const targetDate = date ? new Date(date as string) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await prisma.order.findMany({
      where: {
        waiterId: userId,
        createdAt: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      include: {
        items: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const tablesServed = new Set(orders.map(o => o.tableId)).size;

    const completedOrdersWithTimes = orders
      .filter(o => o.status === 'COMPLETED')
      .map(o => ({
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      }));

    const averageServiceTime = completedOrdersWithTimes.length > 0
      ? completedOrdersWithTimes.reduce((sum, order) => {
          const diff = order.updatedAt.getTime() - order.createdAt.getTime();
          return sum + diff / (1000 * 60);
        }, 0) / completedOrdersWithTimes.length
      : 0;

    res.json({
      date: targetDate,
      ordersServed: orders.length,
      tablesServed,
      totalRevenue,
      averageServiceTime: Math.round(averageServiceTime),
    });
  } catch (error) {
    next(error);
  }
};
