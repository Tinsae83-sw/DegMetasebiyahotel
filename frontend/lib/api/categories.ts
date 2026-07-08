import apiClient from "@/lib/api-client"

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  isActive: boolean
  order: number
}

export interface CreateCategoryData {
  name: string
  description?: string
  image?: string
  isActive?: boolean
  order?: number
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories")
    return response.data
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`)
    return response.data
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post("/categories", data)
    return response.data
  },

  update: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },

  reorder: async (data: { categories: { id: string; order: number }[] }): Promise<void> => {
    await apiClient.post("/categories/reorder", data)
  },
}
