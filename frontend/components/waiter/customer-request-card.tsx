"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Check, X, Eye } from "lucide-react"
import { CustomerRequest, RequestType, RequestStatus } from "@/types/waiter"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface CustomerRequestCardProps {
  request: CustomerRequest
  onAccept?: () => void
  onComplete?: () => void
  onIgnore?: () => void
  onView?: () => void
  showActions?: boolean
}

const requestTypeLabels: Record<RequestType, string> = {
  CALL_WAITER: "Call Waiter",
  REQUEST_BILL: "Request Bill",
  WATER_REQUEST: "Water Request",
  EXTRA_CUTLERY: "Extra Cutlery",
  COMPLAINT: "Complaint",
  SPECIAL_ASSISTANCE: "Special Assistance",
}

const requestTypeIcons: Record<RequestType, string> = {
  CALL_WAITER: "👋",
  REQUEST_BILL: "💳",
  WATER_REQUEST: "💧",
  EXTRA_CUTLERY: "🍴",
  COMPLAINT: "⚠️",
  SPECIAL_ASSISTANCE: "🆘",
}

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-blue-500",
  completed: "bg-green-500",
  ignored: "bg-gray-500",
}

export function CustomerRequestCard({
  request,
  onAccept,
  onComplete,
  onIgnore,
  onView,
  showActions = true,
}: CustomerRequestCardProps) {
  const timeAgo = format(new Date(request.createdAt), 'HH:mm')

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`hover:shadow-lg transition-shadow ${
        request.status === 'pending' ? 'border-yellow-500 border-2' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{requestTypeIcons[request.type]}</span>
              <div>
                <h3 className="font-semibold">{requestTypeLabels[request.type]}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Table {request.tableNumber}</span>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{timeAgo}</span>
                </div>
              </div>
            </div>

            <Badge className={statusColors[request.status]}>
              {request.status}
            </Badge>
          </div>

          {request.notes && (
            <div className="mb-3 p-2 bg-muted rounded text-sm">
              {request.notes}
            </div>
          )}

          {showActions && request.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={onAccept}
              >
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onView}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onIgnore}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {showActions && request.status === 'accepted' && (
            <Button
              size="sm"
              className="w-full"
              onClick={onComplete}
            >
              <Check className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
