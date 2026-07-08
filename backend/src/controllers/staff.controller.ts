import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { hashPassword } from '../utils/password.js';
import { emailService, generateRandomPassword } from '../utils/email.js';
import { Role } from '@prisma/client';

export const getAllStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, isActive } = req.query;

    const where: any = {};
    if (role) where.role = (role as string).toUpperCase() as Role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = Array.isArray(id) ? id[0] : id;
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, role, isActive } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate random password
    const password = generateRandomPassword(12);
    const hashedPassword = await hashPassword(password);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Send welcome email with password
    await emailService.sendPassword(email, password, name);

    res.status(201).json({ 
      ...staff, 
      message: 'Staff member created successfully. Password has been sent to their email.' 
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = Array.isArray(id) ? id[0] : id;
    const data = req.body;

    const staff = await prisma.user.update({
      where: { id: staffId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(staff);
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = Array.isArray(id) ? id[0] : id;

    // Check if staff member exists
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    await prisma.user.delete({
      where: { id: staffId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = Array.isArray(id) ? id[0] : id;
    const { isActive } = req.body;

    const staff = await prisma.user.update({
      where: { id: staffId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    res.json(staff);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const staffId = Array.isArray(id) ? id[0] : id;

    // Get user details before updating
    const user = await prisma.user.findUnique({
      where: { id: staffId },
      select: { name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Generate new random password
    const newPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: staffId },
      data: { password: hashedPassword },
    });

    // Send password reset email
    await emailService.sendPassword(user.email, newPassword, user.name);

    res.json({ message: 'Password reset successfully. New password has been sent to their email.' });
  } catch (error) {
    next(error);
  }
};
