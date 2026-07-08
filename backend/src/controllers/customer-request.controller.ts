import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

declare global {
  var io: any;
}

export const getAllCustomerRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, tableId } = req.query;

    const where: any = {};
    if (status) where.status = Array.isArray(status) ? status[0] : status;
    if (tableId) where.tableId = Array.isArray(tableId) ? tableId[0] : tableId;

    const requests = await prisma.customerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const getCustomerRequestById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const request = await prisma.customerRequest.findUnique({
      where: { id: Array.isArray(id) ? id[0] : id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Customer request not found' });
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

export const getCustomerRequestsByTable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId } = req.params;
    const requests = await prisma.customerRequest.findMany({
      where: { tableId: Array.isArray(tableId) ? tableId[0] : tableId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

export const createCustomerRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const request = await prisma.customerRequest.create({
      data,
    });

    // Emit Socket.IO event to waiters
    if (global.io) {
      global.io.emit('customer-request-created', request);
      global.io.emit('waiter-notification', {
        type: 'CUSTOMER_REQUEST',
        title: 'Customer Request',
        message: `Table ${request.tableNumber} is requesting assistance`,
        tableId: request.tableId,
        requestId: request.id,
        read: false,
        createdAt: new Date(),
      });
    }

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.status === 'completed' && !data.completedAt) {
      data.completedAt = new Date();
    }

    const request = await prisma.customerRequest.update({
      where: { id: Array.isArray(id) ? id[0] : id },
      data,
    });

    // Emit Socket.IO event for request update
    if (global.io) {
      global.io.emit('customer-request-updated', request);
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.customerRequest.delete({
      where: { id: Array.isArray(id) ? id[0] : id },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const createPublicCustomerRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tableId, type, notes } = req.body;

    if (!tableId || !type) {
      return res.status(400).json({ error: 'tableId and type are required' });
    }

    // Fetch table to get table number
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Create customer request
    const request = await prisma.customerRequest.create({
      data: {
        tableId,
        tableNumber: table.number,
        type,
        notes: notes || null,
        status: 'pending',
      },
    });

    // Emit Socket.IO event to waiters
    if (global.io) {
      global.io.emit('customer-request:new', request);
      global.io.emit('customer-request-created', request);
      global.io.emit('waiter-notification', {
        type: 'CUSTOMER_REQUEST',
        title: 'Customer Request',
        message: `Table ${table.number} is requesting assistance`,
        tableId: table.id,
        requestId: request.id,
        read: false,
        createdAt: new Date(),
      });
    }

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};
