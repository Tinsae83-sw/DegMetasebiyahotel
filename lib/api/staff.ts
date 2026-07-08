import apiClient from "@/lib/api-client"

export interface Staff {
  id: string
  name: string
  email: string
  phone?: string
  role: "admin" | "cashier" | "waiter" | "kitchen"
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export interface CreateStaffData {
  name: string
  email: string
  phone?: string
  role: Staff["role"]
  isActive?: boolean
}

export interface UpdateStaffData {
  name?: string
  email?: string
  phone?: string
  role?: Staff["role"]
  isActive?: boolean
}

export const staffApi = {
  getAll: async (params?: { role?: Staff["role"]; isActive?: boolean }): Promise<Staff[]> => {
    const response = await apiClient.get("/staff", { params })
    return response.data
  },

  getById: async (id: string): Promise<Staff> => {
    const response = await apiClient.get(`/staff/${id}`)
    return response.data
  },

  create: async (data: CreateStaffData): Promise<Staff> => {
    const response = await apiClient.post("/staff", data)
    return response.data
  },

  update: async (id: string, data: UpdateStaffData): Promise<Staff> => {
    const response = await apiClient.put(`/staff/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/staff/${id}`)
  },

  toggleActive: async (id: string, isActive: boolean): Promise<Staff> => {
    const response = await apiClient.patch(`/staff/${id}/active`, { isActive })
    return response.data
  },

  resetPassword: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/staff/${id}/reset-password`)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const response = await apiClient.post("/auth/change-password", data)
    return response.data
  },
}
