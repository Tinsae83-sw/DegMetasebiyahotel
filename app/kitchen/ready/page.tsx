"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { KitchenStationFilter } from "@/components/kitchen/kitchen-station-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Bell, UserCheck } from "lucide-react"
import { useKitchenOrders } from "@/hooks/kitchen/use-kitchen-orders"
import { useKitchenSocket, useKitchenRealtimeOrders } from "@/hooks/kitchen/use-kitchen-socket"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import type { KitchenStation } from "@/lib/kitchen/types"

export default function ReadyOrdersPage() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  const [notifiedOrders, setNotifiedOrders] = useState<Set<string>>(new Set())

  const { orders, refetch } = useKitchenOrders({
    status: 'READY',
    station: selectedStation,
  })

  useKitchenSocket(selectedStation)
  useKitchenRealtimeOrders(() => refetch())

  const handleNotifyWaiter = (orderId: string, waiterName: string) => {
    setNotifiedOrders(prev => new Set([...prev, orderId]))
    toast.success(`Notified ${waiterName} that order is ready`)
    // Implement actual notification via Socket.IO
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`)
  }

  const getReadyTime = (readyAt: string) => {
    return formatDistanceToNow(new Date(readyAt), { addSuffix: true })
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

  const readyOrders = orders.data || []

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
              Ready Orders
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Orders ready for pickup by waiters
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <KitchenStationFilter
              selectedStation={selectedStation}
              onStationChange={setSelectedStation}
            />
            <Badge variant="outline" className="text-sm px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg">
              {readyOrders.length} orders
            </Badge>
          </div>
        </div>

        {/* Orders Grid */}
        {readyOrders.length > 0 ? (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
              {readyOrders.map((order: any) => {
                const isNotified = notifiedOrders.has(order.id)
                const waitingTime = order.readyAt 
                  ? Math.floor((Date.now() - new Date(order.readyAt).getTime()) / 60000)
                  : 0

                return (
                  <Card key={order.id} className="border-l-4 border-l-emerald-500 hover:shadow-2xl transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Table {order.tableNumber}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg">
                          Ready
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-gray-600 dark:text-gray-400">Waiter:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{order.waiterName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-gray-600 dark:text-gray-400">Ready:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{order.readyAt ? getReadyTime(order.readyAt) : "N/A"}</span>
                      </div>

                      <div className={`p-3 rounded-lg ${
                        waitingTime > 10 ? "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200" :
                        waitingTime > 5 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200" :
                        "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Waiting for pickup:</span>
                          <span className={`font-bold ${
                            waitingTime > 10 ? "text-red-600" :
                            waitingTime > 5 ? "text-amber-600" :
                            "text-emerald-600"
                          }`}>
                            {waitingTime} min
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={isNotified ? "outline" : "default"}
                          className={isNotified 
                            ? "flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700" 
                            : "flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-500/25"}
                          onClick={() => handleNotifyWaiter(order.id, order.waiterName)}
                          disabled={isNotified}
                        >
                          <Bell className="h-4 w-4 mr-2" />
                          {isNotified ? "Notified" : "Notify"}
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
            {readyOrders.map((order: any) => {
              const isNotified = notifiedOrders.has(order.id)
              const waitingTime = order.readyAt 
                ? Math.floor((Date.now() - new Date(order.readyAt).getTime()) / 60000)
                : 0

              return (
                <div key={order.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                  <Card className="border-l-4 border-l-emerald-500 hover:shadow-2xl transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-emerald-500/20 dark:hover:shadow-emerald-500/10">
                    <CardContent className="p-5 space-y-4">
                      {/* Order Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Table {order.tableNumber}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-lg">
                          Ready
                        </Badge>
                      </div>

                    {/* Waiter Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-gray-600 dark:text-gray-400">Waiter:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.waiterName}</span>
                    </div>

                    {/* Ready Time */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-gray-600 dark:text-gray-400">Ready:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{order.readyAt ? getReadyTime(order.readyAt) : "N/A"}</span>
                    </div>

                    {/* Waiting Time */}
                    <div className={`p-3 rounded-lg ${
                      waitingTime > 10 ? "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200" :
                      waitingTime > 5 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200" :
                      "bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Waiting for pickup:</span>
                        <span className={`font-bold ${
                          waitingTime > 10 ? "text-red-600" :
                          waitingTime > 5 ? "text-amber-600" :
                          "text-emerald-600"
                        }`}>
                          {waitingTime} min
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isNotified ? "outline" : "default"}
                        className={isNotified 
                          ? "flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700" 
                          : "flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 shadow-lg shadow-amber-500/25"}
                        onClick={() => handleNotifyWaiter(order.id, order.waiterName)}
                        disabled={isNotified}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        {isNotified ? "Notified" : "Notify Waiter"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        View
                      </Button>
                    </div>

                    {/* Quick Items Preview */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            +{order.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              )
            })}
            </div>
          </>
        ) : (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl">
            <CardContent className="p-12 text-center text-gray-600 dark:text-gray-400">
              <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No ready orders</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedStation
                  ? `No orders ready for pickup at the ${selectedStation} station`
                  : "No orders are currently ready for pickup"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </KitchenLayout>
  )
}
