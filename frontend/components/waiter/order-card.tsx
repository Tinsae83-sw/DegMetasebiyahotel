"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, MoreVertical, Eye, Edit, Copy, Printer } from "lucide-react"
import { Order, OrderStatus } from "@/types/waiter"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface OrderCardProps {
  order: Order
  onView?: () => void
  onEdit?: () => void
  onDuplicate?: () => void
  onPrint?: () => void
  showActions?: boolean
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-gradient-to-r from-yellow-500 to-amber-600",
  CONFIRMED: "bg-gradient-to-r from-blue-500 to-indigo-600",
  PREPARING: "bg-gradient-to-r from-orange-500 to-red-600",
  READY: "bg-gradient-to-r from-emerald-500 to-green-600",
  SERVED: "bg-gradient-to-r from-purple-500 to-violet-600",
  COMPLETED: "bg-gradient-to-r from-gray-500 to-slate-600",
  CANCELLED: "bg-gradient-to-r from-red-500 to-rose-600",
}

const statusVariants: Record<OrderStatus, "default" | "destructive" | "outline" | "secondary"> = {
  PENDING: "default",
  CONFIRMED: "default",
  PREPARING: "default",
  READY: "default",
  SERVED: "secondary",
  COMPLETED: "outline",
  CANCELLED: "destructive",
}

export function OrderCard({ 
  order, 
  onView, 
  onEdit, 
  onDuplicate, 
  onPrint, 
  showActions = true 
}: OrderCardProps) {
  const canEdit = ['PENDING', 'CONFIRMED'].includes(order.status)
  const canCancel = order.status === 'PENDING'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-2xl transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                <Badge variant={statusVariants[order.status]} className={`${statusColors[order.status]} text-white border-0 shadow-lg`}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">Table {order.tableNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">{format(new Date(order.createdAt), 'HH:mm')}</span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={onView} className="hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-600 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                </Button>
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={onEdit} className="hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-600 dark:text-gray-400">
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onDuplicate} className="hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-600 dark:text-gray-400">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onPrint} className="hover:bg-amber-100 dark:hover:bg-amber-900/30 text-gray-600 dark:text-gray-400">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="text-sm flex justify-between text-gray-700 dark:text-gray-300">
                <span>{item.quantity}x {item.name}</span>
                <span className="text-gray-500 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                +{order.items.length - 3} more items
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {order.items.length} items
            </div>
            <div className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ${order.total.toFixed(2)}
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg text-sm border border-amber-200 dark:border-amber-800">
              <span className="font-semibold text-gray-900 dark:text-white">Note:</span> <span className="text-gray-700 dark:text-gray-300">{order.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
