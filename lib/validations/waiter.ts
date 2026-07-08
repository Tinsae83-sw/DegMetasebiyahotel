import { z } from 'zod'

// Table validation schemas
export const tableSchema = z.object({
  number: z.number().min(1, 'Table number must be at least 1'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  location: z.string().optional(),
})

export const tableTransferSchema = z.object({
  sourceTableId: z.string().min(1, 'Source table is required'),
  destinationTableId: z.string().min(1, 'Destination table is required'),
  orderId: z.string().min(1, 'Order is required'),
  notes: z.string().optional(),
})

// Order validation schemas
export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, 'Menu item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
})

export const orderSchema = z.object({
  tableId: z.string().min(1, 'Table is required'),
  customerId: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  discount: z.number().min(0).max(100).optional(),
})

export const orderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
})

// Customer request validation schemas
export const customerRequestSchema = z.object({
  tableId: z.string().min(1, 'Table is required'),
  type: z.enum(['CALL_WAITER', 'REQUEST_BILL', 'WATER_REQUEST', 'EXTRA_CUTLERY', 'COMPLAINT', 'SPECIAL_ASSISTANCE']),
  notes: z.string().optional(),
})

export const customerRequestUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'completed', 'ignored']),
  notes: z.string().optional(),
})

// Profile validation schemas
export const waiterProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[\d\s\-+()]+$/, 'Invalid phone number').optional(),
  avatar: z.string().url().optional(),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Settings validation schemas
export const waiterSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string().min(2, 'Language is required'),
  notifications: z.object({
    orderUpdates: z.boolean(),
    customerRequests: z.boolean(),
    kitchenUpdates: z.boolean(),
    managerAnnouncements: z.boolean(),
  }),
})
