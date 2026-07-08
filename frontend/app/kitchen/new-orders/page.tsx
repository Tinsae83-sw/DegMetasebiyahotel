"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { KitchenStationFilter } from "@/components/kitchen/kitchen-station-filter"
import { KitchenSearchBar } from "@/components/kitchen/kitchen-search-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Inbox, Filter, SortAsc, ChefHat, CheckCircle, ClipboardCheck } from "lucide-react"
import { useKitchenOrders } from "@/hooks/kitchen/use-kitchen-orders"
import { useKitchenSocket, useKitchenRealtimeOrders } from "@/hooks/kitchen/use-kitchen-socket"
import { useRouter } from "next/navigation"
import type { KitchenStation, OrderPriority } from "@/lib/kitchen/types"

export default function NewOrdersPage() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | "ALL">("ALL")
  const [sortBy, setSortBy] = useState<"time" | "priority">("time")
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED'>('PENDING')

  const { orders, refetch, acceptOrder, rejectOrder, isAccepting, isRejecting } = useKitchenOrders({
    status: statusFilter,
    station: selectedStation,
  })

  useKitchenSocket(selectedStation)
  useKitchenRealtimeOrders(() => refetch())

  const filteredOrders = orders.data?.filter((order: any) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber?.toString().includes(searchQuery) ||
      order.waiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesPriority = priorityFilter === "ALL" || order.priority === priorityFilter

    return matchesSearch && matchesPriority
  }) || []

  const sortedOrders = [...filteredOrders].sort((a: any, b: any) => {
    if (sortBy === "priority") {
      const priorityOrder: { [key: string]: number } = { URGENT: 0, VIP: 1, HIGH: 2, NORMAL: 3 }
      return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999)
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const handleViewOrder = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`)
  }

  const handleAccept = (orderId: string) => {
    acceptOrder({ id: orderId, station: selectedStation })
  }

  const handleReject = (orderId: string) => {
    rejectOrder({ id: orderId, reason: "Rejected by kitchen staff" })
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
              New Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and accept incoming orders
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg w-fit">
            {filteredOrders.length} orders
          </Badge>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
            className={statusFilter === 'PENDING' 
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-700 hover:via-amber-600 hover:to-orange-700 text-white border-0 shadow-xl shadow-amber-500/30 transition-all duration-300 transform hover:scale-105' 
              : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-300 transform hover:scale-105'}
          >
            <Inbox className="h-4 w-4 mr-2" />
            Pending
          </Button>
          <Button
            variant={statusFilter === 'PREPARING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PREPARING')}
            className={statusFilter === 'PREPARING' 
              ? 'bg-gradient-to-r from-purple-600 via-violet-500 to-purple-700 hover:from-purple-700 hover:via-violet-600 hover:to-purple-800 text-white border-0 shadow-xl shadow-purple-500/30 transition-all duration-300 transform hover:scale-105' 
              : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 transform hover:scale-105'}
          >
            <ChefHat className="h-4 w-4 mr-2" />
            Preparing
          </Button>
          <Button
            variant={statusFilter === 'READY' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('READY')}
            className={statusFilter === 'READY' 
              ? 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700 hover:from-emerald-700 hover:via-green-600 hover:to-emerald-800 text-white border-0 shadow-xl shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105' 
              : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-300 transform hover:scale-105'}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Ready
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('COMPLETED')}
            className={statusFilter === 'COMPLETED' 
              ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700 hover:from-blue-700 hover:via-indigo-600 hover:to-blue-800 text-white border-0 shadow-xl shadow-blue-500/30 transition-all duration-300 transform hover:scale-105' 
              : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105'}
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Completed
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <KitchenSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search orders..."
          />
          <KitchenStationFilter
            selectedStation={selectedStation}
            onStationChange={setSelectedStation}
          />
          <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as OrderPriority | "ALL")}>
            <SelectTrigger className="w-36 sm:w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "time" | "priority")}>
            <SelectTrigger className="w-36 sm:w-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Sort by Time</SelectItem>
              <SelectItem value="priority">Sort by Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        {sortedOrders.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {sortedOrders.map((order: any) => (
                <KitchenOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={() => handleViewOrder(order.id)}
                  onAccept={() => handleAccept(order.id)}
                  onReject={() => handleReject(order.id)}
                  isProcessing={isAccepting || isRejecting}
                />
              ))}
            </div>

            {/* Desktop Horizontal Scroll View */}
            <div className="hidden sm:flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {sortedOrders.map((order: any) => (
                <div key={order.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                  <KitchenOrderCard
                    order={order}
                    onViewDetails={() => handleViewOrder(order.id)}
                    onAccept={() => handleAccept(order.id)}
                    onReject={() => handleReject(order.id)}
                    isProcessing={isAccepting || isRejecting}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl">
            <CardContent className="p-12 text-center text-gray-600 dark:text-gray-400">
              <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                <Inbox className="h-8 w-8 text-amber-500 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No new orders</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || selectedStation || priorityFilter !== "ALL"
                  ? "No orders match your current filters"
                  : "Waiting for new orders to come in..."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </KitchenLayout>
  )
}
