"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenStationFilter } from "@/components/kitchen/kitchen-station-filter"
import { KitchenSearchBar } from "@/components/kitchen/kitchen-search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, XCircle, User, Clock, AlertTriangle } from "lucide-react"
import { useKitchenOrders } from "@/hooks/kitchen/use-kitchen-orders"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { KitchenStation } from "@/lib/kitchen/types"

export default function CancelledOrdersPage() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("today")

  const { orders } = useKitchenOrders({
    status: 'CANCELLED',
    station: selectedStation,
  })

  const filteredOrders = orders.data?.filter((order: any) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchQuery) ||
      order.waiterName.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesDate = true
    if (dateFilter !== "all") {
      const orderDate = new Date(order.cancelledAt)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      if (dateFilter === "today") {
        matchesDate = orderDate >= today
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        matchesDate = orderDate >= weekAgo
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today)
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        matchesDate = orderDate >= monthAgo
      }
    }

    return matchesSearch && matchesDate
  }) || []

  const handleViewOrder = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`)
  }

  if (orders.isLoading) {
    return (
      <KitchenLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
      </KitchenLayout>
    )
  }

  return (
    <KitchenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cancelled Orders</h1>
            <p className="text-muted-foreground mt-1">
              View cancelled orders and reasons
            </p>
          </div>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {filteredOrders.length} orders
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <KitchenSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search cancelled orders..."
          />
          <KitchenStationFilter
            selectedStation={selectedStation}
            onStationChange={setSelectedStation}
          />
          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order: any) => (
              <Card key={order.id} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Table {order.tableNumber} • {order.waiterName}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancelled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cancellation Info */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900">Cancellation Reason</p>
                        <p className="text-sm text-red-800 mt-1">
                          {order.cancellationReason || "No reason provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cancelled By */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cancelled by:</span>
                    <span className="font-medium">{order.cancelledBy || "Unknown"}</span>
                  </div>

                  {/* Cancelled Time */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cancelled:</span>
                    <span className="font-medium">
                      {order.cancelledAt ? format(new Date(order.cancelledAt), "MMM dd, HH:mm") : "N/A"}
                    </span>
                  </div>

                  {/* Order Items Preview */}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Items ({order.items.length}):</p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="text-sm flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No cancelled orders</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedStation || dateFilter !== "today"
                  ? "No orders match your current filters"
                  : "No orders have been cancelled"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </KitchenLayout>
  )
}
