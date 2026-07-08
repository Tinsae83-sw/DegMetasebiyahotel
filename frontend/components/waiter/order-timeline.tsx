"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, ChefHat, UtensilsCrossed, Circle } from "lucide-react"
import { OrderStatus } from "@/types/waiter"
import { motion } from "framer-motion"

interface OrderTimelineProps {
  currentStatus: OrderStatus
  createdAt: Date
  confirmedAt?: Date
  preparingAt?: Date
  readyAt?: Date
  servedAt?: Date
  completedAt?: Date
}

interface TimelineStep {
  status: OrderStatus
  label: string
  icon: any
  description: string
}

const timelineSteps: TimelineStep[] = [
  {
    status: 'PENDING',
    label: 'Pending',
    icon: Clock,
    description: 'Order placed and waiting for confirmation',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed',
    icon: Check,
    description: 'Order confirmed by kitchen',
  },
  {
    status: 'PREPARING',
    label: 'Preparing',
    icon: ChefHat,
    description: 'Kitchen is preparing your order',
  },
  {
    status: 'READY',
    label: 'Ready',
    icon: Check,
    description: 'Order is ready to be served',
  },
  {
    status: 'SERVED',
    label: 'Served',
    icon: UtensilsCrossed,
    description: 'Order has been served to customer',
  },
  {
    status: 'COMPLETED',
    label: 'Completed',
    icon: Check,
    description: 'Order completed',
  },
]

export function OrderTimeline({
  currentStatus,
  createdAt,
  confirmedAt,
  preparingAt,
  readyAt,
  servedAt,
  completedAt,
}: OrderTimelineProps) {
  const statusOrder: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']
  const currentIndex = statusOrder.indexOf(currentStatus)

  const getStepStatus = (stepStatus: OrderStatus) => {
    const stepIndex = statusOrder.indexOf(stepStatus)
    if (currentStatus === 'CANCELLED') return 'cancelled'
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  const getStepTime = (stepStatus: OrderStatus) => {
    switch (stepStatus) {
      case 'PENDING':
        return createdAt
      case 'CONFIRMED':
        return confirmedAt
      case 'PREPARING':
        return preparingAt
      case 'READY':
        return readyAt
      case 'SERVED':
        return servedAt
      case 'COMPLETED':
        return completedAt
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-6">Order Status Timeline</h3>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {timelineSteps.map((step, index) => {
              const stepStatus = getStepStatus(step.status)
              const Icon = step.icon
              const stepTime = getStepTime(step.status)

              return (
                <motion.div
                  key={step.status}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Icon */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2
                    ${stepStatus === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${stepStatus === 'current' ? 'bg-amber-500 border-amber-500 text-white' : ''}
                    ${stepStatus === 'pending' ? 'bg-white border-gray-300 text-gray-400' : ''}
                    ${stepStatus === 'cancelled' ? 'bg-red-500 border-red-500 text-white' : ''}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{step.label}</h4>
                      {stepStatus === 'current' && (
                        <Badge className="bg-amber-500">In Progress</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {stepTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(stepTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
