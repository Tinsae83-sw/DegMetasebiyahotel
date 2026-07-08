import apiClient from "@/lib/api-client"

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  totalOrders: number
  totalSpent: number
  lastVisit: string
  loyaltyPoints: number
  tier: "bronze" | "silver" | "gold" | "platinum"
  notes?: string
  createdAt: string
}

export interface CreateCustomerData {
  name: string
  email: string
  phone: string
  address?: string
  notes?: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {}

export const customerApi = {
  getAll: async (params?: { tier?: Customer["tier"]; search?: string }): Promise<Customer[]> => {
    const response = await apiClient.get("/customers", { params })
    return response.data
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  create: async (data: CreateCustomerData): Promise<Customer> => {
    const response = await apiClient.post("/customers", data)
    return response.data
  },

  update: async (id: string, data: UpdateCustomerData): Promise<Customer> => {
    const response = await apiClient.put(`/customers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },

  getOrderHistory: async (id: string): Promise<any[]> => {
    const response = await apiClient.get(`/customers/${id}/orders`)
    return response.data
  },

  addLoyaltyPoints: async (id: string, points: number): Promise<Customer> => {
    const response = await apiClient.post(`/customers/${id}/loyalty`, { points })
    return response.data
  },
}
