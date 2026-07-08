"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenStationFilter } from "@/components/kitchen/kitchen-station-filter"
import { KitchenSearchBar } from "@/components/kitchen/kitchen-search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, ChefHat, CheckCircle, Filter } from "lucide-react"
import { useKitchenOrders } from "@/hooks/kitchen/use-kitchen-orders"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { KitchenStation } from "@/lib/kitchen/types"

export default function CompletedOrdersPage() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("today")
  const [waiterFilter, setWaiterFilter] = useState<string>("all")
  const [tableFilter, setTableFilter] = useState<string>("all")

  const { orders } = useKitchenOrders({
    status: 'COMPLETED',
    station: selectedStation,
  })

  const filteredOrders = orders.data?.filter((order: any) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchQuery) ||
      order.waiterName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesWaiter = waiterFilter === "all" || order.waiterName === waiterFilter
    const matchesTable = tableFilter === "all" || order.tableNumber?.toString() === tableFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      const orderDate = new Date(order.completedAt)
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

    return matchesSearch && matchesWaiter && matchesTable && matchesDate
  }) || []

  // Extract unique waiters and tables for filters
  const uniqueWaiters = Array.from(new Set(orders.data?.map((o: any) => o.waiterName) || []))
  const uniqueTables = Array.from(new Set(orders.data?.map((o: any) => o.tableNumber?.toString()) || []))

  const handleViewOrder = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`)
  }

  const getPreparationTime = (order: any) => {
    if (order.startedPreparingAt && order.completedAt) {
      const minutes = Math.floor((new Date(order.completedAt).getTime() - new Date(order.startedPreparingAt).getTime()) / 60000)
      return `${minutes} min`
    }
    return "N/A"
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
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 space-y-8">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
              Delivered Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View orders that have been delivered to guests by waiters
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg w-fit">
            {filteredOrders.length} orders
          </Badge>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <KitchenSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search orders..."
          />
          <KitchenStationFilter
            selectedStation={selectedStation}
            onStationChange={setSelectedStation}
          />
          <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as any)}>
            <SelectTrigger className="w-36 sm:w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700">
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
          {uniqueWaiters.length > 0 && (
            <Select value={waiterFilter} onValueChange={setWaiterFilter}>
              <SelectTrigger className="w-36 sm:w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Waiters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Waiters</SelectItem>
                {uniqueWaiters.map((waiter) => (
                  <SelectItem key={waiter as string} value={waiter as string}>{waiter as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {uniqueTables.length > 0 && (
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-36 sm:w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {uniqueTables.map((table) => (
                  <SelectItem key={table as string} value={table as string}>Table {table as string}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Orders Display */}
        {filteredOrders.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {filteredOrders.map((order: any) => (
                <Card key={order.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Table {order.tableNumber}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg">
                        Delivered
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="truncate">{order.waiterName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span>{getPreparationTime(order)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <ChefHat className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="truncate">{order.assignedKitchenStaff || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="font-medium">{order.items.length} items</span>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">
                        {order.completedAt && format(new Date(order.completedAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-blue-500/25"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View Order Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Grid View - 3 per row */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order: any) => (
                <Card key={order.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                          #{order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Table {order.tableNumber}</p>
                      </div>
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg text-xs">
                        Delivered
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-500">{order.items.length} items</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="truncate">{order.waiterName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{getPreparationTime(order)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <ChefHat className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="truncate">{order.assignedKitchenStaff || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs">{order.completedAt && format(new Date(order.completedAt), "MMM dd, HH:mm")}</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg shadow-emerald-500/25 mt-2"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl">
            <CardContent className="p-12 text-center text-gray-600 dark:text-gray-400">
              <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No delivered orders</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedStation || dateFilter !== "today" || waiterFilter !== "all" || tableFilter !== "all"
                  ? "No orders match your current filters"
                  : "No orders have been delivered to guests yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </KitchenLayout>
  )
}
