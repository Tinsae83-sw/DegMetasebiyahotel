"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Check, ShoppingCart, DollarSign, AlertTriangle, Info, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "order" | "payment" | "stock" | "system" | "kitchen"
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "order",
      title: "New Order Received",
      message: "Order #1234 from Table 5",
      timestamp: new Date().toISOString(),
      read: false,
    },
    {
      id: "2",
      type: "payment",
      title: "Payment Completed",
      message: "Order #1233 payment of $45.67 received",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false,
    },
    {
      id: "3",
      type: "kitchen",
      title: "Order Ready",
      message: "Order #1232 is ready for serving",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: true,
    },
    {
      id: "4",
      type: "stock",
      title: "Low Stock Alert",
      message: "Grilled Salmon is running low (5 items left)",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: "5",
      type: "system",
      title: "System Update",
      message: "New features have been deployed",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification["type"]) => {
    const icons = {
      order: <ShoppingCart className="h-4 w-4" />,
      payment: <DollarSign className="h-4 w-4" />,
      stock: <AlertTriangle className="h-4 w-4" />,
      system: <Info className="h-4 w-4" />,
      kitchen: <ChefHat className="h-4 w-4" />,
    }
    return icons[type]
  }

  const getColor = (type: Notification["type"]) => {
    const colors = {
      order: "bg-blue-100 text-blue-800",
      payment: "bg-green-100 text-green-800",
      stock: "bg-orange-100 text-orange-800",
      system: "bg-purple-100 text-purple-800",
      kitchen: "bg-yellow-100 text-yellow-800",
    }
    return colors[type]
  }

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-4 top-16 z-50 w-96 max-h-[80vh] overflow-hidden rounded-lg border bg-background shadow-lg">
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "border-b p-4 hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-muted/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn("mt-0.5 rounded-full p-2", getColor(notification.type))}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.timestamp)}
                        </span>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
