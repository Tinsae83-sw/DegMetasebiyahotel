"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  MessageSquare,
  ChefHat
} from "lucide-react"
import { useKitchenNotifications } from "@/hooks/kitchen/use-kitchen-notifications"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface KitchenNotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function KitchenNotificationPanel({ open, onClose }: KitchenNotificationPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useKitchenNotifications()

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_ORDER":
        return <ChefHat className="h-5 w-5 text-orange-600" />
      case "CANCELLED_ORDER":
        return <X className="h-5 w-5 text-red-600" />
      case "MODIFIED_ORDER":
        return <Info className="h-5 w-5 text-blue-600" />
      case "PRIORITY_ORDER":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "MANAGER_ANNOUNCEMENT":
        return <MessageSquare className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "NEW_ORDER":
        return "bg-orange-50 border-orange-200"
      case "CANCELLED_ORDER":
        return "bg-red-50 border-red-200"
      case "MODIFIED_ORDER":
        return "bg-blue-50 border-blue-200"
      case "PRIORITY_ORDER":
        return "bg-red-50 border-red-200"
      case "MANAGER_ANNOUNCEMENT":
        return "bg-purple-50 border-purple-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.2 }}
          className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-xl z-50"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h2 className="font-semibold">Notifications</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`${getNotificationColor(notification.type)} ${
                        !notification.read ? "border-2" : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
