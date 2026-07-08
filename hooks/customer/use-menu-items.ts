import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  category?: {
    id: string
    name: string
  }
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isSpicy: boolean
  isPopular: boolean
  isRecommended: boolean
  preparationTime: number
  ingredients: string[]
  allergens: string[]
  calories: number
  createdAt: string
  updatedAt: string
}

export function useMenuItems(categoryId?: string) {
  return useQuery({
    queryKey: ["menu-items", categoryId],
    queryFn: async () => {
      const params = categoryId ? { categoryId } : {}
      const { data } = await axios.get<MenuItem[]>(`${API_URL}/menu-items`, { params })
      return data
    },
  })
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: ["menu-item", id],
    queryFn: async () => {
      const { data } = await axios.get<MenuItem>(`${API_URL}/menu-items/${id}`)
      return data
    },
    enabled: !!id,
  })
}
