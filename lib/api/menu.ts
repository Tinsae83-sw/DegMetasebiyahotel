import apiClient from "@/lib/api-client"

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  images: string[]
  preparationTime: number
  ingredients: string[]
  isFeatured: boolean
  isAvailable: boolean
  spicyLevel: number
  tags: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export interface CreateMenuItemData {
  name: string
  description: string
  price: number
  categoryId: string
  images?: string[]
  preparationTime: number
  ingredients: string[]
  isFeatured?: boolean
  isAvailable?: boolean
  spicyLevel?: number
  tags?: string[]
  nutritionalInfo?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {}

export const menuApi = {
  getAll: async (params?: { categoryId?: string; availableOnly?: boolean }): Promise<MenuItem[]> => {
    const response = await apiClient.get("/menu-items", { params })
    return response.data
  },

  getById: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get(`/menu-items/${id}`)
    return response.data
  },

  create: async (data: CreateMenuItemData, imageFile?: File): Promise<MenuItem> => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    formData.append('categoryId', data.categoryId)
    formData.append('preparationTime', data.preparationTime.toString())
    formData.append('ingredients', JSON.stringify(data.ingredients))
    formData.append('isFeatured', data.isFeatured?.toString() || 'false')
    formData.append('isAvailable', data.isAvailable?.toString() || 'true')
    formData.append('spicyLevel', data.spicyLevel?.toString() || '0')
    formData.append('tags', JSON.stringify(data.tags || []))
    if (data.nutritionalInfo?.calories) formData.append('calories', data.nutritionalInfo.calories.toString())
    if (data.nutritionalInfo?.protein) formData.append('protein', data.nutritionalInfo.protein.toString())
    if (data.nutritionalInfo?.carbs) formData.append('carbs', data.nutritionalInfo.carbs.toString())
    if (data.nutritionalInfo?.fat) formData.append('fat', data.nutritionalInfo.fat.toString())
    if (imageFile) formData.append('image', imageFile)

    const response = await apiClient.post("/menu-items", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  update: async (id: string, data: UpdateMenuItemData, imageFile?: File): Promise<MenuItem> => {
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name)
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.price !== undefined) formData.append('price', data.price.toString())
    if (data.categoryId !== undefined) formData.append('categoryId', data.categoryId)
    if (data.preparationTime !== undefined) formData.append('preparationTime', data.preparationTime.toString())
    if (data.ingredients !== undefined) formData.append('ingredients', JSON.stringify(data.ingredients))
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured.toString())
    if (data.isAvailable !== undefined) formData.append('isAvailable', data.isAvailable.toString())
    if (data.spicyLevel !== undefined) formData.append('spicyLevel', data.spicyLevel.toString())
    if (data.tags !== undefined) formData.append('tags', JSON.stringify(data.tags))
    if (data.nutritionalInfo?.calories !== undefined) formData.append('calories', data.nutritionalInfo.calories.toString())
    if (data.nutritionalInfo?.protein !== undefined) formData.append('protein', data.nutritionalInfo.protein.toString())
    if (data.nutritionalInfo?.carbs !== undefined) formData.append('carbs', data.nutritionalInfo.carbs.toString())
    if (data.nutritionalInfo?.fat !== undefined) formData.append('fat', data.nutritionalInfo.fat.toString())
    if (imageFile) formData.append('image', imageFile)

    const response = await apiClient.put(`/menu-items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu-items/${id}`)
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<MenuItem> => {
    const response = await apiClient.patch(`/menu-items/${id}/availability`, { isAvailable })
    return response.data
  },

  toggleFeatured: async (id: string, isFeatured: boolean): Promise<MenuItem> => {
    const response = await apiClient.patch(`/menu-items/${id}/featured`, { isFeatured })
    return response.data
  },
}
