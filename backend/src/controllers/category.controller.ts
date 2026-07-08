import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { menuItems: true },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const category = await prisma.category.create({
      data,
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    const data = req.body;
    const category = await prisma.category.update({
      where: { id: categoryId },
      data,
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const categoryId = Array.isArray(id) ? id[0] : id;
    await prisma.category.delete({
      where: { id: categoryId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categories } = req.body;
    
    await Promise.all(
      categories.map((cat: { id: string; order: number }) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { order: cat.order },
        })
      )
    );

    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    next(error);
  }
};
