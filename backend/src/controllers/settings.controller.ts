import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.restaurantSettings.findFirst();

    if (!settings) {
      settings = await prisma.restaurantSettings.create({
        data: {
          name: 'My Restaurant',
          address: '123 Main Street',
          phone: '+1234567890',
          email: 'restaurant@example.com',
        },
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    let settings = await prisma.restaurantSettings.findFirst();

    if (!settings) {
      settings = await prisma.restaurantSettings.create({ data });
    } else {
      settings = await prisma.restaurantSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const uploadLogo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = 'https://cloudinary.com/uploaded-logo-url';
    
    let settings = await prisma.restaurantSettings.findFirst();
    if (settings) {
      settings = await prisma.restaurantSettings.update({
        where: { id: settings.id },
        data: { logo: url },
      });
    }

    res.json({ url });
  } catch (error) {
    next(error);
  }
};

export const uploadCoverImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = 'https://cloudinary.com/uploaded-cover-url';
    
    let settings = await prisma.restaurantSettings.findFirst();
    if (settings) {
      settings = await prisma.restaurantSettings.update({
        where: { id: settings.id },
        data: { coverImage: url },
      });
    }

    res.json({ url });
  } catch (error) {
    next(error);
  }
};
