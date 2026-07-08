"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import type { OrderTimeline, OrderStatus } from "@/lib/kitchen/types"
import { formatDistanceToNow } from "date-fns"

interface KitchenOrderTimelineProps {
  timeline: OrderTimeline[]
  currentStatus: OrderStatus
}

export function KitchenOrderTimeline({ timeline, currentStatus }: KitchenOrderTimelineProps) {
  const statusOrder: OrderStatus[] = ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED"]

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "ACCEPTED":
        return <CheckCircle2 className="h-4 w-4" />
      case "PREPARING":
        return <Clock className="h-4 w-4 animate-spin" />
      case "READY":
        return <CheckCircle2 className="h-4 w-4" />
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "ACCEPTED":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "PREPARING":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "READY":
        return "bg-green-100 text-green-800 border-green-300"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((event, index) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${getStatusColor(event.status)} border`}>
                  {getStatusIcon(event.status)}
                </div>
                {index < timeline.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(event.status)} variant="outline">
                    {event.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
                </div>
                {event.note && (
                  <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                )}
                {event.performedBy && (
                  <p className="text-xs text-muted-foreground mt-1">by {event.performedBy}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
