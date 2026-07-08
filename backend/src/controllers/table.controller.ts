import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getAllTables = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    let whereClause: any = {};
    
    // If user is a waiter, only show tables assigned to them
    if (user && user.role === 'WAITER') {
      whereClause.waiterId = user.userId;
    }
    
    const tables = await prisma.table.findMany({
      where: whereClause,
      include: {
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: true,
      },
      orderBy: { number: 'asc' },
    });
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        orders: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: true,
      },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const table = await prisma.table.create({
      data,
    });
    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const data = req.body;
    const table = await prisma.table.update({
      where: { id: tableId },
      data,
    });
    res.json(table);
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    await prisma.table.delete({
      where: { id: tableId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const generateQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const qrCode = `https://your-restaurant.com/menu?table=${table.number}`;
    
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: { qrCode },
    });

    res.json({ qrCode });
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const { isActive } = req.body;
    const table = await prisma.table.update({
      where: { id: tableId },
      data: { isActive },
    });
    res.json(table);
  } catch (error) {
    next(error);
  }
};

export const callWaiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Emit real-time event to waiters
    if (global.io) {
      global.io.to('waiters').emit('call-waiter', {
        tableId: table.id,
        tableNumber: table.number,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ message: 'Waiter called successfully' });
  } catch (error) {
    next(error);
  }
};

export const requestBill = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        orders: {
          where: {
            paymentStatus: 'PENDING',
            status: { in: ['READY', 'COMPLETED'] },
          },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Emit real-time event to cashiers
    if (global.io) {
      global.io.to('cashiers').emit('bill-requested', {
        tableId: table.id,
        tableNumber: table.number,
        orders: table.orders,
        timestamp: new Date().toISOString(),
      });
    }

    res.json({ message: 'Bill requested successfully' });
  } catch (error) {
    next(error);
  }
};

export const assignWaiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;
    const { waiterId } = req.body;

    // Verify waiter exists and has WAITER role
    if (waiterId) {
      const waiter = await prisma.user.findUnique({
        where: { id: waiterId },
      });

      if (!waiter || waiter.role !== 'WAITER') {
        return res.status(400).json({ error: 'Invalid waiter ID' });
      }
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: { waiterId },
      include: {
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: true,
      },
    });

    res.json(table);
  } catch (error) {
    next(error);
  }
};

export const removeWaiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tableId = Array.isArray(id) ? id[0] : id;

    const table = await prisma.table.update({
      where: { id: tableId },
      data: { waiterId: null },
      include: {
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: true,
      },
    });

    res.json(table);
  } catch (error) {
    next(error);
  }
};
