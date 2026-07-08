"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Bell, 
  Check, 
  X, 
  Clock, 
  Users, 
  ChefHat, 
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Trash2,
  CheckCheck
} from "lucide-react"
import { Notification } from "@/types/waiter"
import { format, differenceInMinutes } from "date-fns"
import { motion } from "framer-motion"

interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationCenter({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return Clock
      case 'CUSTOMER_REQUEST':
        return Bell
      case 'KITCHEN_UPDATE':
        return ChefHat
      case 'MANAGER_ANNOUNCEMENT':
        return AlertCircle
      case 'RESERVATION':
        return Users
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return 'text-blue-600 bg-blue-100'
      case 'CUSTOMER_REQUEST':
        return 'text-red-600 bg-red-100'
      case 'KITCHEN_UPDATE':
        return 'text-orange-600 bg-orange-100'
      case 'MANAGER_ANNOUNCEMENT':
        return 'text-purple-600 bg-purple-100'
      case 'RESERVATION':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getNotificationTime = (notification: Notification) => {
    const created = new Date(notification.createdAt)
    const now = new Date()
    const minutes = differenceInMinutes(now, created)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return format(created, 'MMM d')
  }

  const unreadNotifications = notifications.filter(n => !n.read)
  const readNotifications = notifications.filter(n => n.read)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {unreadNotifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Unread ({unreadNotifications.length})
              </h3>
              {unreadNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  getIcon={getNotificationIcon}
                  getColor={getNotificationColor}
                  getTime={getNotificationTime}
                />
              ))}
            </div>
          )}

          {readNotifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Read ({readNotifications.length})
              </h3>
              {readNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  getIcon={getNotificationIcon}
                  getColor={getNotificationColor}
                  getTime={getNotificationTime}
                />
              ))}
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  getIcon: (type: Notification['type']) => any
  getColor: (type: Notification['type']) => string
  getTime: (notification: Notification) => string
}

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  getIcon, 
  getColor, 
  getTime 
}: NotificationItemProps) {
  const Icon = getIcon(notification.type)
  const colorClass = getColor(notification.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        !notification.read ? 'bg-amber-50 border-amber-200' : 'bg-muted'
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="text-xs text-muted-foreground mt-2">
            {getTime(notification)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
