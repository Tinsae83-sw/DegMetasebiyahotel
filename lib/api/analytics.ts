import apiClient from "@/lib/api-client"

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
  pendingOrders: number
  activeTables: number
}

export interface SalesData {
  date: string
  revenue: number
  orders: number
}

export interface TopSellingItem {
  id: string
  name: string
  orders: number
  revenue: number
}

export interface CategoryPerformance {
  categoryId: string
  categoryName: string
  orders: number
  revenue: number
  percentage: number
}

export interface PeakHour {
  hour: string
  orders: number
}

export interface SalesByPeriod {
  period: "day" | "week" | "month" | "year"
  startDate: string
  endDate: string
  totalRevenue: number
  totalOrders: number
  data: {
    period: string
    revenue: number
    orders: number
  }[]
}

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get("/analytics/dashboard")
    return response.data
  },

  getSalesData: async (params: { startDate: string; endDate: string; granularity?: "hour" | "day" | "week" | "month" }): Promise<SalesData[]> => {
    const response = await apiClient.get("/analytics/sales", { params })
    return response.data
  },

  getTopSellingItems: async (params: { limit?: number; startDate?: string; endDate?: string }): Promise<TopSellingItem[]> => {
    const response = await apiClient.get("/analytics/top-items", { params })
    return response.data
  },

  getCategoryPerformance: async (params: { startDate?: string; endDate?: string }): Promise<CategoryPerformance[]> => {
    const response = await apiClient.get("/analytics/categories", { params })
    return response.data
  },

  getPeakHours: async (params: { startDate?: string; endDate?: string }): Promise<PeakHour[]> => {
    const response = await apiClient.get("/analytics/peak-hours", { params })
    return response.data
  },

  getPaymentMethods: async (params: { startDate?: string; endDate?: string }): Promise<{ method: string; amount: number; percentage: number }[]> => {
    const response = await apiClient.get("/analytics/payments", { params })
    return response.data
  },

  getSalesByPeriod: async (period: "day" | "week" | "month" | "year"): Promise<SalesByPeriod> => {
    const response = await apiClient.get("/analytics/sales-by-period", { params: { period } })
    return response.data
  },

  generateReport: async (params: {
    type: "daily" | "inventory" | "customer" | "performance" | "revenue" | "staff"
    startDate: string
    endDate: string
    format: "pdf" | "excel"
  }): Promise<{ downloadUrl: string }> => {
    const response = await apiClient.post("/analytics/reports", params)
    return response.data
  },
}
