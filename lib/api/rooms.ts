import apiClient from "@/lib/api-client"

export interface Room {
  id: string
  name: string
  description?: string
  capacity: number
  location?: string
  isActive: boolean
  qrCode?: string
  waiterId?: string
  waiter?: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
  tables?: any[]
}

export interface CreateRoomData {
  name: string
  description?: string
  capacity: number
  location?: string
  isActive?: boolean
}

export interface UpdateRoomData extends Partial<CreateRoomData> {}

export const roomApi = {
  getAll: async (): Promise<Room[]> => {
    const response = await apiClient.get("/rooms")
    return response.data
  },

  getById: async (id: string): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`)
    return response.data
  },

  create: async (data: CreateRoomData): Promise<Room> => {
    const response = await apiClient.post("/rooms", data)
    return response.data
  },

  update: async (id: string, data: UpdateRoomData): Promise<Room> => {
    const response = await apiClient.put(`/rooms/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rooms/${id}`)
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Room> => {
    const response = await apiClient.patch(`/rooms/${id}/active`, { isActive })
    return response.data
  },

  generateQR: async (id: string): Promise<{ qrCode: string }> => {
    const response = await apiClient.post(`/rooms/${id}/generate-qr`)
    return response.data
  },

  assignWaiter: async (id: string, waiterId: string): Promise<Room> => {
    const response = await apiClient.post(`/rooms/${id}/assign-waiter`, { waiterId })
    return response.data
  },

  removeWaiter: async (id: string): Promise<Room> => {
    const response = await apiClient.delete(`/rooms/${id}/waiter`)
    return response.data
  },
}
