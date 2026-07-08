import apiClient from "@/lib/api-client"

export interface RestaurantSettings {
  name?: string
  logo?: string
  coverImage?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  googleMapsLocation?: string
  currency?: string
  language?: string
  taxPercentage?: number
  serviceCharge?: number
  themeColors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
  openingHours: {
    [key: string]: {
      open: string
      close: string
      isOpen: boolean
    }
  }
}

export const settingsApi = {
  get: async (): Promise<RestaurantSettings> => {
    const response = await apiClient.get("/settings")
    return response.data
  },

  update: async (data: Partial<RestaurantSettings>): Promise<RestaurantSettings> => {
    const response = await apiClient.put("/settings", data)
    return response.data
  },

  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/settings/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },

  uploadCoverImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/settings/cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
  },
}
