import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get<Category[]>(`${API_URL}/categories`)
      return data.filter((cat) => cat.isActive)
    },
  })
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const { data } = await axios.get<Category>(`${API_URL}/categories/${id}`)
      return data
    },
    enabled: !!id,
  })
}
