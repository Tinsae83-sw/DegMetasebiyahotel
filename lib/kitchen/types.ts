export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
export type OrderPriority = 'NORMAL' | 'HIGH' | 'VIP' | 'URGENT'
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
export type KitchenStation = 'GRILL' | 'PIZZA' | 'PASTA' | 'SALAD' | 'DRINKS' | 'DESSERTS' | 'COFFEE' | 'BAKERY'

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  notes?: string
  specialInstructions?: string
  allergies?: string[]
  station: KitchenStation
  imageUrl?: string
}

export interface Order {
  id: string
  orderNumber: string
  tableNumber?: number
  waiterId: string
  waiterName: string
  customerName?: string
  status: OrderStatus
  priority: OrderPriority
  orderType: OrderType
  items: OrderItem[]
  specialInstructions?: string
  estimatedPreparationTime?: number
  actualPreparationTime?: number
  createdAt: string
  acceptedAt?: string
  startedPreparingAt?: string
  readyAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  cancelledBy?: string
  assignedKitchenStaff?: string
  station?: KitchenStation
}

export interface KitchenStats {
  totalPendingOrders: number
  acceptedOrders: number
  preparingOrders: number
  readyOrders: number
  completedOrders: number
  cancelledOrders: number
  averagePreparationTime: number
  ordersCompletedToday: number
  currentWorkload: number
  kitchenStatus: 'BUSY' | 'NORMAL'
}

export interface KitchenPerformance {
  ordersToday: number
  averageCookingTime: number
  fastestPreparation: number
  slowestPreparation: number
  completionRate: number
  kitchenEfficiency: number
  peakHours: { hour: number; orders: number }[]
}

export interface KitchenNotification {
  id: string
  type: 'NEW_ORDER' | 'CANCELLED_ORDER' | 'MODIFIED_ORDER' | 'PRIORITY_ORDER' | 'MANAGER_ANNOUNCEMENT'
  title: string
  message: string
  orderId?: string
  timestamp: string
  read: boolean
}

export interface KitchenSettings {
  notificationSound: boolean
  fullScreenMode: boolean
  darkMode: boolean
  language: string
  autoRefresh: boolean
  refreshInterval: number
  displayDensity: 'COMPACT' | 'NORMAL' | 'COMFORTABLE'
  defaultStation?: KitchenStation
}

export interface KitchenStaff {
  id: string
  name: string
  email: string
  role: 'KITCHEN_STAFF' | 'HEAD_CHEF' | 'KITCHEN_MANAGER'
  station?: KitchenStation
  avatar?: string
  isActive: boolean
}

export interface OrderTimeline {
  id: string
  orderId: string
  status: OrderStatus
  timestamp: string
  note?: string
  performedBy?: string
}
