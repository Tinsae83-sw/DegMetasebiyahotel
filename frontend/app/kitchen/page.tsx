"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenStatCard } from "@/components/kitchen/kitchen-stat-card"
import { KitchenOrderCard } from "@/components/kitchen/kitchen-order-card"
import { KitchenStationFilter } from "@/components/kitchen/kitchen-station-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  ChefHat, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Inbox,
  ArrowRight
} from "lucide-react"
import { useKitchenOrders } from "@/hooks/kitchen/use-kitchen-orders"
import { useKitchenStats } from "@/hooks/kitchen/use-kitchen-stats"
import { useKitchenSocket, useKitchenRealtimeOrders } from "@/hooks/kitchen/use-kitchen-socket"
import { useRouter } from "next/navigation"
import type { KitchenStation } from "@/lib/kitchen/types"

export default function KitchenDashboard() {
  const router = useRouter()
  const [selectedStation, setSelectedStation] = useState<KitchenStation | undefined>()
  
  const { stats, isLoading: statsLoading } = useKitchenStats()
  const { orders, refetch } = useKitchenOrders({ 
    status: 'PENDING',
    station: selectedStation 
  })
  
  useKitchenSocket(selectedStation)
  useKitchenRealtimeOrders(() => refetch())

  const recentOrders = orders.data?.slice(0, 6) || []
  const activeOrders = orders.data?.filter((o: any) => 
    ['ACCEPTED', 'PREPARING'].includes(o.status)
  ) || []

  const handleViewOrder = (orderId: string) => {
    router.push(`/kitchen/orders/${orderId}`)
  }

  if (statsLoading || orders.isLoading) {
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
              Kitchen Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time order management and monitoring
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <KitchenStationFilter 
              selectedStation={selectedStation}
              onStationChange={setSelectedStation}
            />
            <Badge 
              variant={stats?.kitchenStatus === 'BUSY' ? 'destructive' : 'default'}
              className={`text-sm px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg ${stats?.kitchenStatus === 'BUSY' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-0' : ''}`}
            >
              {stats?.kitchenStatus === 'BUSY' ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Busy
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-1" />
                  Normal
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KitchenStatCard
            title="Pending Orders"
            value={stats?.totalPendingOrders || 0}
            icon={Inbox}
            color="text-yellow-600"
            delay={0}
          />
          <KitchenStatCard
            title="Preparing"
            value={stats?.preparingOrders || 0}
            icon={ChefHat}
            color="text-purple-600"
            delay={0.1}
          />
          <KitchenStatCard
            title="Ready Orders"
            value={stats?.readyOrders || 0}
            icon={CheckCircle}
            color="text-green-600"
            delay={0.2}
          />
          <KitchenStatCard
            title="Completed Today"
            value={stats?.ordersCompletedToday || 0}
            icon={Activity}
            color="text-blue-600"
            delay={0.3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KitchenStatCard
            title="Avg. Prep Time"
            value={`${stats?.averagePreparationTime || 0}m`}
            icon={Clock}
            color="text-orange-600"
            delay={0.4}
          />
          <KitchenStatCard
            title="Workload"
            value={stats?.currentWorkload || 0}
            icon={TrendingUp}
            color="text-indigo-600"
            delay={0.5}
          />
          <KitchenStatCard
            title="Cancelled"
            value={stats?.cancelledOrders || 0}
            icon={AlertTriangle}
            color="text-red-600"
            delay={0.6}
          />
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Orders</h2>
            <Button 
              variant="outline" 
              onClick={() => router.push('/kitchen/new-orders')}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg w-fit"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                  <KitchenOrderCard
                    order={order}
                    onViewDetails={() => handleViewOrder(order.id)}
                    onAccept={() => {/* Handle accept */}}
                    onReject={() => {/* Handle reject */}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl">
              <CardContent className="p-12 text-center text-gray-600 dark:text-gray-400">
                <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                  <Inbox className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                </div>
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No new orders</p>
                <p className="text-sm">Orders will appear here when received</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active Cooking Queue */}
        {activeOrders.length > 0 && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Cooking Queue</h2>
              <Button 
                variant="outline"
                onClick={() => router.push('/kitchen/preparing')}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg w-fit"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {activeOrders.map((order: any) => (
                <div key={order.id} className="min-w-[320px] md:min-w-[400px] snap-start">
                  <KitchenOrderCard
                    order={order}
                    onViewDetails={() => handleViewOrder(order.id)}
                    onStartPreparing={() => {/* Handle start preparing */}}
                    onMarkReady={() => {/* Handle mark ready */}}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </KitchenLayout>
  )
}
