import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getAllRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    
    let whereClause: any = {};
    
    // If user is a waiter, only show rooms assigned to them
    if (user && user.role === 'WAITER') {
      whereClause.waiterId = user.userId;
    }
    
    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: {
        tables: {
          include: {
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        tables: {
          include: {
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const room = await prisma.room.create({
      data,
      include: {
        tables: true,
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;
    const data = req.body;
    const room = await prisma.room.update({
      where: { id: roomId },
      data,
      include: {
        tables: {
          include: {
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;
    await prisma.room.delete({
      where: { id: roomId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;
    const { isActive } = req.body;
    const room = await prisma.room.update({
      where: { id: roomId },
      data: { isActive },
      include: {
        tables: {
          include: {
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const generateQR = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const qrCode = `https://your-restaurant.com/menu?room=${room.id}`;
    
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: { qrCode },
    });

    res.json({ qrCode });
  } catch (error) {
    next(error);
  }
};

export const assignWaiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;
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

    const room = await prisma.room.update({
      where: { id: roomId },
      data: { waiterId },
      include: {
        tables: {
          include: {
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(room);
  } catch (error) {
    next(error);
  }
};

export const removeWaiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const roomId = Array.isArray(id) ? id[0] : id;

    const room = await prisma.room.update({
      where: { id: roomId },
      data: { waiterId: null },
      include: {
        tables: {
          include: {
            waiter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        waiter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(room);
  } catch (error) {
    next(error);
  }
};
