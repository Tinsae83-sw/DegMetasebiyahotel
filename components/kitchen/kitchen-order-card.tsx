"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, CheckCircle, X, AlertTriangle, User } from "lucide-react"
import { motion } from "framer-motion"
import type { Order, OrderStatus } from "@/lib/kitchen/types"
import { formatDistanceToNow } from "date-fns"

interface KitchenOrderCardProps {
  order: Order
  onViewDetails?: () => void
  onAccept?: () => void
  onReject?: () => void
  onStartPreparing?: () => void
  onMarkReady?: () => void
  onComplete?: () => void
  isProcessing?: boolean
}

export function KitchenOrderCard({
  order,
  onViewDetails,
  onAccept,
  onReject,
  onStartPreparing,
  onMarkReady,
  onComplete,
  isProcessing = false,
}: KitchenOrderCardProps) {
  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      PENDING: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0",
      ACCEPTED: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0",
      PREPARING: "bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0",
      READY: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0",
      COMPLETED: "bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0",
      CANCELLED: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0",
    }
    return colors[status]
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      NORMAL: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300",
      HIGH: "bg-gradient-to-r from-orange-100 to-amber-200 text-orange-700 border-orange-300",
      VIP: "bg-gradient-to-r from-purple-100 to-violet-200 text-purple-700 border-purple-300",
      URGENT: "bg-gradient-to-r from-red-100 to-rose-200 text-red-700 border-red-300 animate-pulse",
    }
    return colors[priority] || colors.NORMAL
  }

  const getBorderColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      PENDING: "border-l-amber-500",
      ACCEPTED: "border-l-blue-500",
      PREPARING: "border-l-purple-500",
      READY: "border-l-emerald-500",
      COMPLETED: "border-l-gray-500",
      CANCELLED: "border-l-red-500",
    }
    return colors[status]
  }

  const getTimeElapsed = (timestamp?: string) => {
    if (!timestamp) return "N/A"
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className={`border-l-4 ${getBorderColor(order.status)} hover:shadow-2xl transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                <Badge className={`${getPriorityColor(order.priority)} shadow-lg`} variant="outline">
                  {order.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {order.tableNumber && (
                  <span className="flex items-center gap-2 font-medium">
                    <span className="text-amber-600 dark:text-amber-400">Table {order.tableNumber}</span>
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">{order.waiterName}</span>
                </span>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} shadow-lg`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-3">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium">{getTimeElapsed(order.createdAt)}</span>
            {order.estimatedPreparationTime && (
              <span className="text-gray-500 dark:text-gray-500">• Est. {order.estimatedPreparationTime} min</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{item.quantity}x {item.name}</span>
                {item.notes && (
                  <span className="text-xs text-gray-500 dark:text-gray-500 italic max-w-[150px] truncate">
                    {item.notes}
                  </span>
                )}
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-500">
                +{order.items.length - 3} more items
              </div>
            )}
          </div>

          {order.specialInstructions && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                <span className="font-semibold">Special:</span> {order.specialInstructions}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={onViewDetails}
            >
              View Details
            </Button>

            {order.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 border-0"
                  onClick={onAccept}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0"
                  onClick={onReject}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}

            {order.status === "ACCEPTED" && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 border-0"
                onClick={onStartPreparing}
                disabled={isProcessing}
              >
                <ChefHat className="h-4 w-4 mr-1" />
                Start Preparing
              </Button>
            )}

            {order.status === "PREPARING" && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25 border-0"
                onClick={onMarkReady}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Ready
              </Button>
            )}

            {order.status === "READY" && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 border-0"
                onClick={onComplete}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
