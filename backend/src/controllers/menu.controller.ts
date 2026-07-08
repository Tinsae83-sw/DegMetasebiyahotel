import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

const normalizeMenuItem = (menuItem: any) => {
  const tags = Array.isArray(menuItem.tags) ? menuItem.tags : [];
  const normalizedTags = tags.map((tag: unknown) => String(tag).toLowerCase());
  const tagSet = new Set(normalizedTags);

  return {
    ...menuItem,
    image: menuItem.images?.[0] || '',
    isVegetarian: tagSet.has('vegetarian') || tagSet.has('veggie'),
    isVegan: tagSet.has('vegan'),
    isSpicy: menuItem.spicyLevel > 0 || tagSet.has('spicy'),
    isPopular: tagSet.has('popular') || menuItem.isFeatured,
    isRecommended: menuItem.isFeatured,
    preparationTime: menuItem.preparationTime ?? 15,
    ingredients: menuItem.ingredients ?? [],
    allergens: [],
    calories: menuItem.calories ?? 0,
  };
};

export const getAllMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, availableOnly } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId as string;
    if (availableOnly === 'true') where.isAvailable = true;

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(menuItems.map(normalizeMenuItem));
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: id as string },
      include: { category: true },
    });

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(normalizeMenuItem(menuItem));
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, categoryId, preparationTime, ingredients, isFeatured, isAvailable, spicyLevel, tags, calories, protein, carbs, fat } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        images: imageUrl ? [imageUrl] : [],
        preparationTime: parseInt(preparationTime) || 15,
        ingredients: ingredients ? JSON.parse(ingredients) : [],
        isFeatured: isFeatured === 'true' || isFeatured === true,
        isAvailable: isAvailable === 'true' || isAvailable === true,
        spicyLevel: parseInt(spicyLevel) || 0,
        tags: tags ? JSON.parse(tags) : [],
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
      },
      include: { category: true },
    });
    res.status(201).json(menuItem);
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, preparationTime, ingredients, isFeatured, isAvailable, spicyLevel, tags, calories, protein, carbs, fat } = req.body;
    
    const existingItem = await prisma.menuItem.findUnique({ where: { id: id as string } });
    if (!existingItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    let imageUrl = existingItem.images[0] || '';
    if (req.file) {
      if (imageUrl) {
        await deleteImage(imageUrl);
      }
      imageUrl = await uploadImage(req.file);
    }

    const menuItem = await prisma.menuItem.update({
      where: { id: id as string },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : existingItem.price,
        categoryId: categoryId || existingItem.categoryId,
        images: imageUrl ? [imageUrl] : existingItem.images,
        preparationTime: preparationTime !== undefined ? parseInt(preparationTime) : existingItem.preparationTime,
        ingredients: ingredients ? JSON.parse(ingredients) : existingItem.ingredients,
        isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : existingItem.isFeatured,
        isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : existingItem.isAvailable,
        spicyLevel: spicyLevel !== undefined ? parseInt(spicyLevel) : existingItem.spicyLevel,
        tags: tags ? JSON.parse(tags) : existingItem.tags,
        calories: calories !== undefined ? parseFloat(calories) : existingItem.calories,
        protein: protein !== undefined ? parseFloat(protein) : existingItem.protein,
        carbs: carbs !== undefined ? parseFloat(carbs) : existingItem.carbs,
        fat: fat !== undefined ? parseFloat(fat) : existingItem.fat,
      },
      include: { category: true },
    });
    res.json(menuItem);
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const menuItem = await prisma.menuItem.findUnique({ where: { id: id as string } });
    
    if (menuItem && menuItem.images[0]) {
      await deleteImage(menuItem.images[0]);
    }
    
    await prisma.menuItem.delete({
      where: { id: id as string },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const menuItem = await prisma.menuItem.update({
      where: { id: id as string },
      data: { isAvailable },
    });
    res.json(menuItem);
  } catch (error) {
    next(error);
  }
};

export const toggleFeatured = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const menuItem = await prisma.menuItem.update({
      where: { id: id as string },
      data: { isFeatured },
    });
    res.json(menuItem);
  } catch (error) {
    next(error);
  }
};
