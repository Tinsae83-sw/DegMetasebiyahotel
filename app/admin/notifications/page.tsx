"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, ShoppingCart, XCircle, MessageSquare, Users, ChefHat, LogOut, Check, CheckCheck, AlertTriangle } from "lucide-react"

const notifications: any[] = [
  {
    id: "1",
    type: "large_order",
    title: "Large Order Received",
    message: "Order #ORD-007 for $450.00 has been received at Table 12",
    timestamp: new Date("2024-01-15T14:35:00"),
    read: false,
    priority: "high"
  },
  {
    id: "2",
    type: "cancelled_order",
    title: "Order Cancelled",
    message: "Order #ORD-006 has been cancelled by the customer",
    timestamp: new Date("2024-01-15T14:20:00"),
    read: false,
    priority: "medium"
  },
  {
    id: "3",
    type: "complaint",
    title: "New Customer Complaint",
    message: "Customer at Table 5 has filed a complaint about service quality",
    timestamp: new Date("2024-01-15T14:10:00"),
    read: false,
    priority: "high"
  },
  {
    id: "4",
    type: "kitchen_delay",
    title: "Kitchen Delay Alert",
    message: "Order #ORD-004 is delayed by 15 minutes",
    timestamp: new Date("2024-01-15T14:00:00"),
    read: true,
    priority: "medium"
  },
  {
    id: "5",
    type: "low_staff",
    title: "Low Staff Availability",
    message: "Only 2 waiters are currently on duty during peak hours",
    timestamp: new Date("2024-01-15T13:45:00"),
    read: true,
    priority: "high"
  },
  {
    id: "6",
    type: "shift_closed",
    title: "Cashier Shift Closed",
    message: "Chris Lee has closed their shift. Total transactions: 45",
    timestamp: new Date("2024-01-15T13:30:00"),
    read: true,
    priority: "low"
  },
  {
    id: "7",
    type: "announcement",
    title: "System Announcement",
    message: "Scheduled maintenance will occur tonight at 2:00 AM",
    timestamp: new Date("2024-01-15T13:00:00"),
    read: true,
    priority: "low"
  }
]

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState(notifications)

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5"
    switch (type) {
      case "large_order":
        return <ShoppingCart className={iconClass} />
      case "cancelled_order":
        return <XCircle className={iconClass} />
      case "complaint":
        return <MessageSquare className={iconClass} />
      case "low_staff":
        return <Users className={iconClass} />
      case "kitchen_delay":
        return <ChefHat className={iconClass} />
      case "shift_closed":
        return <LogOut className={iconClass} />
      case "announcement":
        return <AlertTriangle className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "large_order":
        return "bg-blue-500"
      case "cancelled_order":
        return "bg-red-500"
      case "complaint":
        return "bg-red-500"
      case "low_staff":
        return "bg-orange-500"
      case "kitchen_delay":
        return "bg-yellow-500"
      case "shift_closed":
        return "bg-green-500"
      case "announcement":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const handleMarkAsRead = (id: string) => {
    setAllNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = () => {
    setAllNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const unreadCount = allNotifications.filter(n => !n.read).length

  return (
    <AdminLayout>
      <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount} unread notifications
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notification.read
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </span>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <Badge className="bg-blue-500">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </AdminLayout>
  )
}
