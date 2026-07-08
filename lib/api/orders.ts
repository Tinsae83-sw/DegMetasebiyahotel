import apiClient from "@/lib/api-client"

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  tableNumber: number
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  paymentMethod?: "cash" | "card" | "chapa"
  waiter?: { id: string; name: string }
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateOrderData {
  tableNumber: number
  tableId?: string
  items: { menuItemId: string; name: string; quantity: number; price: number; notes?: string }[]
  waiterId?: string
  notes?: string
}

export interface UpdateOrderData {
  status?: Order["status"]
  paymentStatus?: Order["paymentStatus"]
  paymentMethod?: Order["paymentMethod"]
  discount?: number
  notes?: string
}

export const orderApi = {
  getAll: async (params?: { status?: Order["status"]; paymentStatus?: Order["paymentStatus"] }): Promise<Order[]> => {
    const response = await apiClient.get("/orders", { params })
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post("/orders", data)
    return response.data
  },

  update: async (id: string, data: UpdateOrderData): Promise<Order> => {
    const response = await apiClient.put(`/orders/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`)
  },

  updateStatus: async (id: string, status: Order["status"]): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  processPayment: async (id: string, data: {
    paymentMethod: Order["paymentMethod"]
    amount: number
    cashReceived?: number
  }): Promise<Order> => {
    const response = await apiClient.post(`/orders/${id}/payment`, data)
    return response.data
  },

  getReceipt: async (id: string): Promise<{ receiptUrl: string }> => {
    const response = await apiClient.get(`/orders/${id}/receipt`)
    return response.data
  },
}
