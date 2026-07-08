"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { KitchenTimer } from "@/components/kitchen/kitchen-timer"
import { KitchenStationFilter } from "@/components/kitchen/kitchen-station-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Clock, AlertTriangle, Pause, Play } from "lucide-react"
import { useKitchenOrders } from "@/hooks/kitchen/use-kitchen-orders"
import { useKitchenSocket, useKitchenRealtimeOrders } from "@/hooks/kitchen/use-kitchen-socket"
import { useRouter } from "next/navigation"
import type { KitchenStation } from "@/lib/kitchen/types"

export default function PreparingOrdersPage() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  const [pausedOrders, setPausedOrders] = useState<Set<string>>(new Set())

  const { orders, refetch, markReady, isMarkingReady } = useKitchenOrders({
    status: 'PREPARING',
    station: selectedStation,
  })

  useKitchenSocket(selectedStation)
  useKitchenRealtimeOrders(() => refetch())

  const togglePause = (orderId: string) => {
    setPausedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`)
  }

  const handleMarkReady = (orderId: string) => {
    markReady(orderId)
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

  const preparingOrders = orders.data || []

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
              Preparing Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage orders currently being prepared
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <KitchenStationFilter
              selectedStation={selectedStation}
              onStationChange={setSelectedStation}
            />
            <Badge variant="outline" className="text-sm px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg">
              {preparingOrders.length} orders
            </Badge>
          </div>
        </div>

        {/* Orders Grid with Timers */}
        {preparingOrders.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {preparingOrders.map((order: any) => {
                const isPaused = pausedOrders.has(order.id)
                const isOverdue = order.startedPreparingAt && order.estimatedPreparationTime
                  ? (Date.now() - new Date(order.startedPreparingAt).getTime()) / 1000 / 60 > order.estimatedPreparationTime
                  : false

                return (
                  <Card key={order.id} className={`${isOverdue ? "border-red-500 bg-gradient-to-r from-red-50 to-rose-50" : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50"} shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50`}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <ChefHat className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Table {order.tableNumber}</p>
                          </div>
                        </div>
                        {isOverdue && (
                          <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-rose-600 border-0 animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>

                      <KitchenTimer
                        startTime={order.startedPreparingAt}
                        estimatedTime={order.estimatedPreparationTime}
                        isOverdue={isOverdue}
                      />

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePause(order.id)}
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700"
                        >
                          {isPaused ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25"
                          onClick={() => handleMarkReady(order.id)}
                          disabled={isMarkingReady}
                        >
                          Mark Ready
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View Order Details
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Desktop Horizontal Scroll View */}
            <div className="hidden sm:flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {preparingOrders.map((order: any) => {
                const isPaused = pausedOrders.has(order.id)
                const isOverdue = order.startedPreparingAt && order.estimatedPreparationTime
                  ? (Date.now() - new Date(order.startedPreparingAt).getTime()) / 1000 / 60 > order.estimatedPreparationTime
                  : false

                return (
                  <div key={order.id} className="min-w-[320px] md:min-w-[400px] space-y-4 snap-start">
                    <Card className={`${isOverdue ? "border-red-500 bg-gradient-to-r from-red-50 to-rose-50" : "bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50"} shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50`}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <ChefHat className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Table {order.tableNumber}</p>
                            </div>
                          </div>
                          {isOverdue && (
                            <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-rose-600 border-0 animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </Badge>
                          )}
                        </div>

                        <KitchenTimer
                          startTime={order.startedPreparingAt}
                          estimatedTime={order.estimatedPreparationTime}
                          isOverdue={isOverdue}
                        />

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePause(order.id)}
                            className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700"
                          >
                            {isPaused ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25"
                            onClick={() => handleMarkReady(order.id)}
                            disabled={isMarkingReady}
                          >
                            Mark Ready
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <KitchenOrderCard
                      order={order}
                      onViewDetails={() => handleViewOrder(order.id)}
                      onMarkReady={() => handleMarkReady(order.id)}
                      isProcessing={isMarkingReady}
                    />
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl">
            <CardContent className="p-12 text-center text-gray-600 dark:text-gray-400">
              <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-full flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders being prepared</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedStation
                  ? `No orders currently being prepared at the ${selectedStation} station`
                  : "No orders are currently being prepared"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </KitchenLayout>
  )
}
