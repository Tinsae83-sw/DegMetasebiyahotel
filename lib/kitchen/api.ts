import axios from 'axios';
import type { Order, KitchenStats, KitchenPerformance, KitchenNotification, KitchenSettings, KitchenStaff, OrderTimeline } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const kitchenApi = {
  // Orders
  getOrders: async (params?: { status?: string; station?: string; priority?: string }) => {
    const response = await apiClient.get('/kitchen/orders', { params });
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get(`/kitchen/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/kitchen/orders/${id}/status`, { status });
    return response.data;
  },

  acceptOrder: async (id: string, station?: string) => {
    const response = await apiClient.post(`/kitchen/orders/${id}/accept`, { station });
    return response.data;
  },

  rejectOrder: async (id: string, reason?: string) => {
    const response = await apiClient.post(`/kitchen/orders/${id}/reject`, { reason });
    return response.data;
  },

  startPreparing: async (id: string) => {
    const response = await apiClient.post(`/kitchen/orders/${id}/start-preparing`);
    return response.data;
  },

  markReady: async (id: string) => {
    const response = await apiClient.post(`/kitchen/orders/${id}/ready`);
    return response.data;
  },

  completeOrder: async (id: string) => {
    const response = await apiClient.post(`/kitchen/orders/${id}/complete`);
    return response.data;
  },

  updateOrderItem: async (orderId: string, itemId: string, data: any) => {
    const response = await apiClient.patch(`/kitchen/orders/${orderId}/items/${itemId}`, data);
    return response.data;
  },

  // Kitchen Stats
  getKitchenStats: async () => {
    const response = await apiClient.get('/kitchen/stats');
    return response.data;
  },

  // Kitchen Performance
  getKitchenPerformance: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/kitchen/performance', { params: { startDate, endDate } });
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await apiClient.get('/kitchen/notifications');
    return response.data;
  },

  markNotificationRead: async (id: string) => {
    const response = await apiClient.patch(`/kitchen/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.post('/kitchen/notifications/read-all');
    return response.data;
  },

  // Kitchen Staff
  getKitchenStaff: async () => {
    const response = await apiClient.get('/kitchen/staff');
    return response.data;
  },

  updateKitchenStaff: async (id: string, data: Partial<KitchenStaff>) => {
    const response = await apiClient.patch(`/kitchen/staff/${id}`, data);
    return response.data;
  },

  // Settings
  getKitchenSettings: async () => {
    const response = await apiClient.get('/kitchen/settings');
    return response.data;
  },

  updateKitchenSettings: async (data: Partial<KitchenSettings>) => {
    const response = await apiClient.patch('/kitchen/settings', data);
    return response.data;
  },

  // Order Timeline
  getOrderTimeline: async (orderId: string) => {
    const response = await apiClient.get(`/kitchen/orders/${orderId}/timeline`);
    return response.data;
  },
};
