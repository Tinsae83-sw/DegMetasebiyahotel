import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
    order: z.number().optional(),
  }),
});

export const menuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    categoryId: z.string().min(1, 'Category is required'),
    images: z.array(z.string()).min(1, 'At least one image is required'),
    preparationTime: z.number().min(1, 'Preparation time is required'),
    ingredients: z.array(z.string()).min(1, 'At least one ingredient is required'),
    isFeatured: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
    spicyLevel: z.number().min(0).max(3).optional(),
    tags: z.array(z.string()).optional(),
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  }),
});

export const tableSchema = z.object({
  body: z.object({
    number: z.number().min(1, 'Table number is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const roomSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const orderSchema = z.object({
  body: z.object({
    tableNumber: z.number().min(1, 'Table number is required'),
    tableId: z.string().min(1, 'Table ID is required').optional(),
    waiterId: z.string().min(1, 'Waiter ID is required').optional(),
    customerId: z.union([z.string().min(1), z.literal('')]).optional(),
    items: z.array(z.object({
      menuItemId: z.string().min(1, 'Menu item ID is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      notes: z.string().optional(),
    })).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
});

export const customerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone is required'),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const staffSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'cashier', 'waiter', 'kitchen'], {
      errorMap: () => ({ message: 'Invalid role. Must be one of: admin, cashier, waiter, kitchen' })
    }).transform(val => val.toUpperCase()),
    isActive: z.boolean().optional(),
  }),
});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: z.enum(['admin', 'cashier', 'waiter', 'kitchen'], {
      errorMap: () => ({ message: 'Invalid role. Must be one of: admin, cashier, waiter, kitchen' })
    }).optional().transform(val => val ? val.toUpperCase() : val),
    isActive: z.boolean().optional(),
  }),
});
