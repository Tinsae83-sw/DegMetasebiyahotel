import { z } from "zod"

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  preparationTime: z.number().min(1, "Preparation time is required"),
  ingredients: z.array(z.string()).min(1, "At least one ingredient is required"),
  isFeatured: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
  spicyLevel: z.number().min(0).max(3).default(0),
  tags: z.array(z.string()).default([]),
  nutritionalInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  }).optional(),
})

export type MenuItemFormData = z.infer<typeof menuItemSchema>

export const tableSchema = z.object({
  number: z.number().min(1, "Table number is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type TableFormData = z.infer<typeof tableSchema>

export const staffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "cashier", "waiter", "kitchen"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean().default(true),
})

export type StaffFormData = z.infer<typeof staffSchema>
