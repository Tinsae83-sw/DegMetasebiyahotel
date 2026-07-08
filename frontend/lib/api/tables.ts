import apiClient from "@/lib/api-client"

export interface Table {
  id: string
  number: number
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
  room?: {
    id: string
    name: string
  }
}

export interface CreateTableData {
  number: number
  capacity: number
  location?: string
  isActive?: boolean
}

export interface UpdateTableData extends Partial<CreateTableData> {}

export const tableApi = {
  getAll: async (): Promise<Table[]> => {
    const response = await apiClient.get("/tables")
    return response.data
  },

  getById: async (id: string): Promise<Table> => {
    const response = await apiClient.get(`/tables/${id}`)
    return response.data
  },

  create: async (data: CreateTableData): Promise<Table> => {
    const response = await apiClient.post("/tables", data)
    return response.data
  },

  update: async (id: string, data: UpdateTableData): Promise<Table> => {
    const response = await apiClient.put(`/tables/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tables/${id}`)
  },

  generateQR: async (id: string): Promise<{ qrCode: string }> => {
    const response = await apiClient.post(`/tables/${id}/generate-qr`)
    return response.data
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Table> => {
    const response = await apiClient.patch(`/tables/${id}/active`, { isActive })
    return response.data
  },

  assignWaiter: async (id: string, waiterId: string): Promise<Table> => {
    const response = await apiClient.post(`/tables/${id}/assign-waiter`, { waiterId })
    return response.data
  },

  removeWaiter: async (id: string): Promise<Table> => {
    const response = await apiClient.delete(`/tables/${id}/waiter`)
    return response.data
  },
}
