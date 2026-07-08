import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, search } = req.query;

    const where: any = {};
    if (tier) where.tier = tier as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = Array.isArray(id) ? id[0] : id;
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { orders: true },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const customer = await prisma.customer.create({
      data,
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = Array.isArray(id) ? id[0] : id;
    const data = req.body;
    const customer = await prisma.customer.update({
      where: { id: customerId },
      data,
    });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = Array.isArray(id) ? id[0] : id;
    await prisma.customer.delete({
      where: { id: customerId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getOrderHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = Array.isArray(id) ? id[0] : id;
    const orders = await prisma.order.findMany({
      where: { customerId: customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const addLoyaltyPoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = Array.isArray(id) ? id[0] : id;
    const { points } = req.body;

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: { increment: points },
      },
    });

    res.json(customer);
  } catch (error) {
    next(error);
  }
};
