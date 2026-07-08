import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      pendingOrders,
      activeTables,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['customerId'],
        where: {
          customerId: {
            not: null,
          },
        },
      }).then((groups) => groups.length),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.table.count({
        where: { isActive: true },
      }),
    ]);

    const averageOrderValue = totalOrders > 0
      ? (totalRevenue._sum.total || 0) / totalOrders
      : 0;

    res.json({
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      averageOrderValue,
      totalCustomers,
      pendingOrders,
      activeTables,
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, granularity = 'day' } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const salesData = orders.map((order) => ({
      date: order.createdAt.toISOString().split('T')[0],
      revenue: order.total,
      orders: 1,
    }));

    res.json(salesData);
  } catch (error) {
    next(error);
  }
};

export const getTopSellingItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
          },
        },
      },
      include: {
        menuItem: true,
      },
    });

    const itemSales = new Map();

    orderItems.forEach((item) => {
      const existing = itemSales.get(item.menuItemId) || {
        id: item.menuItemId,
        name: item.name,
        orders: 0,
        revenue: 0,
      };
      existing.orders += item.quantity;
      existing.revenue += item.price * item.quantity;
      itemSales.set(item.menuItemId, existing);
    });

    const topItems = Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, Number(limit));

    res.json(topItems);
  } catch (error) {
    next(error);
  }
};

export const getCategoryPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate ? new Date(startDate as string) : undefined,
            lte: endDate ? new Date(endDate as string) : undefined,
          },
        },
      },
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
      },
    });

    const categorySales = new Map();

    orderItems.forEach((item) => {
      const categoryId = item.menuItem.categoryId;
      const categoryName = item.menuItem.category.name;
      const existing = categorySales.get(categoryId) || {
        categoryId,
        categoryName,
        orders: 0,
        revenue: 0,
      };
      existing.orders += item.quantity;
      existing.revenue += item.price * item.quantity;
      categorySales.set(categoryId, existing);
    });

    const totalRevenue = Array.from(categorySales.values()).reduce(
      (sum, cat) => sum + cat.revenue,
      0
    );

    const performance = Array.from(categorySales.values()).map((cat) => ({
      ...cat,
      percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0,
    }));

    res.json(performance);
  } catch (error) {
    next(error);
  }
};

export const getPeakHours = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const hourCounts = new Map();

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const hourStr = `${hour}:00`;
      const existing = hourCounts.get(hourStr) || 0;
      hourCounts.set(hourStr, existing + 1);
    });

    const peakHours = Array.from(hourCounts.entries()).map(([hour, orders]) => ({
      hour,
      orders,
    }));

    res.json(peakHours);
  } catch (error) {
    next(error);
  }
};

export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        paymentMethod: { not: null },
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      select: {
        paymentMethod: true,
        total: true,
      },
    });

    const methodTotals = new Map();

    orders.forEach((order) => {
      const method = order.paymentMethod;
      const existing = methodTotals.get(method) || { amount: 0, count: 0 };
      existing.amount += order.total;
      existing.count += 1;
      methodTotals.set(method, existing);
    });

    const totalAmount = Array.from(methodTotals.values()).reduce(
      (sum, m) => sum + m.amount,
      0
    );

    const paymentMethods = Array.from(methodTotals.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));

    res.json(paymentMethods);
  } catch (error) {
    next(error);
  }
};

export const getSalesByPeriod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { period = 'day' } = req.query;

    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        groupBy = 'hour';
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        groupBy = 'day';
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        startDate.setHours(0, 0, 0, 0);
        groupBy = 'month';
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        groupBy = 'hour';
    }

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const salesMap = new Map();

    orders.forEach((order) => {
      let key: string;
      const date = new Date(order.createdAt);

      if (groupBy === 'hour') {
        key = `${date.getHours()}:00`;
      } else if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const existing = salesMap.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      salesMap.set(key, existing);
    });

    const salesData = Array.from(salesMap.entries()).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      orders: data.orders,
    }));

    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);

    res.json({
      period: period as string,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      totalRevenue,
      totalOrders,
      data: salesData,
    });
  } catch (error) {
    next(error);
  }
};

export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, startDate, endDate, format } = req.body;

    const downloadUrl = `https://your-restaurant.com/reports/${type}/${startDate}/${endDate}.${format}`;

    res.json({ downloadUrl });
  } catch (error) {
    next(error);
  }
};

export const getStaffPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['WAITER', 'KITCHEN', 'CASHIER']
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true
      }
    });

    const staffPerformance = await Promise.all(
      users.map(async (user) => {
        const orders = await prisma.order.findMany({
          where: {
            waiterId: user.id,
            createdAt: {
              gte: start,
              lte: end
            }
          },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            tableId: true,
            items: true
          }
        });

        let performance: any = {
          id: user.id,
          name: user.name,
          role: user.role.toLowerCase(),
          email: user.email,
          phone: user.phone
        };

        if (user.role === 'WAITER') {
          const ordersServed = orders.length;
          const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
          const tablesServed = new Set(orders.map(o => o.tableId)).size;
          
          const orderTimes = orders
            .filter(o => o.createdAt && o.updatedAt)
            .map(o => {
              const created = new Date(o.createdAt).getTime();
              const updated = new Date(o.updatedAt).getTime();
              return (updated - created) / (1000 * 60); // minutes
            });
          
          const averageServiceTime = orderTimes.length > 0 
            ? orderTimes.reduce((sum, time) => sum + time, 0) / orderTimes.length 
            : 0;

          performance = {
            ...performance,
            ordersServed,
            tablesServed,
            totalRevenue,
            averageServiceTime: Math.round(averageServiceTime),
            customerRating: 4.5 // Placeholder - would come from feedback
          };
        } else if (user.role === 'KITCHEN') {
          const orderItems = await prisma.orderItem.findMany({
            where: {
              order: {
                createdAt: {
                  gte: start,
                  lte: end
                }
              }
            },
            include: {
              order: {
                select: {
                  createdAt: true,
                  updatedAt: true,
                  status: true
                }
              }
            }
          });

          const ordersPrepared = orderItems.length;
          const preparationTimes = orderItems
            .filter(item => item.order.createdAt && item.order.updatedAt)
            .map(item => {
              const created = new Date(item.order.createdAt).getTime();
              const updated = new Date(item.order.updatedAt).getTime();
              return (updated - created) / (1000 * 60); // minutes
            });

          const averageCookingTime = preparationTimes.length > 0
            ? preparationTimes.reduce((sum, time) => sum + time, 0) / preparationTimes.length
            : 0;

          const delayedOrders = orderItems.filter(item => 
            item.order.status === 'CANCELLED'
          ).length;

          performance = {
            ...performance,
            ordersPrepared,
            averageCookingTime: Math.round(averageCookingTime),
            delayedOrders,
            accuracy: 98.5 // Placeholder - would come from actual accuracy calculation
          };
        } else if (user.role === 'CASHIER') {
          const cashierOrders = await prisma.order.findMany({
            where: {
              paymentStatus: 'PAID',
              createdAt: {
                gte: start,
                lte: end
              }
            },
            select: {
              id: true,
              total: true,
              paymentMethod: true,
              createdAt: true,
              updatedAt: true
            }
          });

          const transactions = cashierOrders.length;
          const revenueProcessed = cashierOrders.reduce((sum, order) => sum + order.total, 0);
          
          const transactionTimes = cashierOrders
            .filter(order => order.createdAt && order.updatedAt)
            .map(order => {
              const created = new Date(order.createdAt).getTime();
              const updated = new Date(order.updatedAt).getTime();
              return (updated - created) / 1000; // seconds
            });

          const averageTransactionTime = transactionTimes.length > 0
            ? transactionTimes.reduce((sum, time) => sum + time, 0) / transactionTimes.length
            : 0;

          const refunds = await prisma.order.count({
            where: {
              paymentStatus: 'REFUNDED',
              createdAt: {
                gte: start,
                lte: end
              }
            }
          });

          performance = {
            ...performance,
            transactions,
            revenueProcessed,
            averageTransactionTime: Math.round(averageTransactionTime),
            refunds,
            rating: 4.8 // Placeholder
          };
        }

        return performance;
      })
    );

    res.json(staffPerformance);
  } catch (error) {
    next(error);
  }
};

export const getMenuPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      },
      include: {
        menuItem: {
          include: {
            category: true
          }
        }
      }
    });

    const menuItemsMap = new Map();

    orderItems.forEach((item) => {
      const existing = menuItemsMap.get(item.menuItemId) || {
        id: item.menuItemId,
        name: item.menuItem.name,
        category: item.menuItem.category.name,
        ordersCount: 0,
        revenue: 0,
        averageRating: 0,
        ratingSum: 0,
        ratingCount: 0
      };
      
      existing.ordersCount += item.quantity;
      existing.revenue += item.price * item.quantity;
      
      menuItemsMap.set(item.menuItemId, existing);
    });

    const menuPerformance = Array.from(menuItemsMap.values()).map(item => ({
      ...item,
      averageRating: item.ratingCount > 0 ? item.ratingSum / item.ratingCount : 0,
      availability: item.menuItem?.isAvailable ? 100 : 0
    }));

    const totalOrders = menuPerformance.reduce((sum, item) => sum + item.ordersCount, 0);
    const totalRevenue = menuPerformance.reduce((sum, item) => sum + item.revenue, 0);

    const bestSelling = [...menuPerformance]
      .sort((a, b) => b.ordersCount - a.ordersCount)
      .slice(0, 5);

    const leastSelling = [...menuPerformance]
      .sort((a, b) => a.ordersCount - b.ordersCount)
      .slice(0, 5);

    const categoryPerformance = await getCategoryPerformanceData(start, end);

    res.json({
      menuItems: menuPerformance,
      bestSelling,
      leastSelling,
      categoryPerformance,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    next(error);
  }
};

async function getCategoryPerformanceData(startDate: Date, endDate: Date) {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    },
    include: {
      menuItem: {
        include: {
          category: true
        }
      }
    }
  });

  const categoryMap = new Map();

  orderItems.forEach((item) => {
    const categoryId = item.menuItem.categoryId;
    const categoryName = item.menuItem.category.name;
    const existing = categoryMap.get(categoryId) || {
      categoryId,
      categoryName,
      orders: 0,
      revenue: 0
    };
    existing.orders += item.quantity;
    existing.revenue += item.price * item.quantity;
    categoryMap.set(categoryId, existing);
  });

  const totalRevenue = Array.from(categoryMap.values()).reduce(
    (sum, cat) => sum + cat.revenue,
    0
  );

  return Array.from(categoryMap.values()).map((cat) => ({
    ...cat,
    percentage: totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0
  }));
}
