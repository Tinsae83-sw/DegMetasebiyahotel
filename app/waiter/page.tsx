"use client"

import { useState } from "react"
import { WaiterLayout } from "@/components/layout/waiter-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  Bell, 
  DollarSign,
  Activity,
  PlusCircle,
  ChefHat,
  UtensilsCrossed,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { useAuth } from "@/hooks/use-auth"
import { useWaiterStats } from "@/hooks/waiter/use-waiter-stats"
import { useCustomerRequests } from "@/hooks/waiter/use-customer-requests"
import { useWaiterNotifications } from "@/hooks/waiter/use-waiter-notifications"
import { TableCard } from "@/components/waiter/table-card"
import { OrderCard } from "@/components/waiter/order-card"
import { CustomerRequestCard } from "@/components/waiter/customer-request-card"
import { StatCard } from "@/components/waiter/stat-card"
import { TableStatus, OrderStatus } from "@/types/waiter"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { format } from "date-fns"

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']

export default function WaiterDashboard() {
  const { user, loading: authLoading } = useAuth()
  const { tables } = useTables()
  const { orders, refetch } = useOrders()
  const { stats } = useWaiterStats()
  const { requests } = useCustomerRequests()
  const { notifications, unreadCount } = useWaiterNotifications()
  
  const [selectedTable, setSelectedTable] = useState<any>(null)

  const tablesData = tables.data || []
  const ordersData = orders.data || []
  const requestsData = requests.data || []
  const statsData = stats?.data || undefined

  // Filter orders for today's waiter
  const waiterOrders = ordersData.filter(order => order.waiter?.id === user?.id || order.waiterId === user?.id)
  
  const activeOrders = waiterOrders.filter(o => 
    ['pending', 'confirmed', 'preparing'].includes(o.status)
  )
  const readyOrders = waiterOrders.filter(o => o.status === 'ready')
  const completedOrders = waiterOrders.filter(o => o.status === 'completed')
  const pendingOrders = waiterOrders.filter(o => o.status === 'pending')
  const preparingOrders = waiterOrders.filter(o => o.status === 'preparing')

  const getTableStatus = (tableId: string): TableStatus => {
    const tableOrders = ordersData.filter(o => o.tableId === tableId && o.status !== 'completed')
    if (tableOrders.length === 0) return 'available'
    return 'occupied'
  }

  const handleCreateOrder = (table: any) => {
    setSelectedTable(table)
    window.location.href = `/waiter/orders/create?tableId=${table.id}`
  }

  // Calculate table statistics
  const availableTables = tablesData.filter(t => getTableStatus(t.id) === 'available').length
  const occupiedTables = tablesData.filter(t => getTableStatus(t.id) === 'occupied').length
  const reservedTables = tablesData.filter(t => t.status === 'reserved').length

  // Chart data
  const hourlyOrdersData = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9 // 9 AM to 8 PM
    const hourOrders = waiterOrders.filter(o => 
      new Date(o.createdAt).getHours() === hour
    ).length
    return { hour: `${hour}:00`, orders: hourOrders }
  })

  const orderStatusData = [
    { name: 'Pending', value: pendingOrders.length, color: '#f59e0b' },
    { name: 'Preparing', value: preparingOrders.length, color: '#3b82f6' },
    { name: 'Ready', value: readyOrders.length, color: '#10b981' },
    { name: 'Completed', value: completedOrders.length, color: '#8b5cf6' },
  ]

  const tableStatusData = [
    { name: 'Available', value: availableTables, color: '#10b981' },
    { name: 'Occupied', value: occupiedTables, color: '#f59e0b' },
    { name: 'Reserved', value: reservedTables, color: '#3b82f6' },
  ]

  return (
    <WaiterLayout>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 space-y-8">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
              Waiter Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Welcome back, <span className="font-semibold text-amber-700 dark:text-amber-400">{authLoading ? 'Loading...' : user?.name || 'User'}</span> <span className="hidden xs:inline">•</span> <br className="xs:hidden" /> {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button variant="outline" size="sm" className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => window.location.href = '/waiter/orders/create'}
            className="h-24 justify-start gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-xl shadow-amber-500/25 w-full border-0"
          >
            <PlusCircle className="h-6 w-6 flex-shrink-0" />
            <span className="text-left min-w-0">
              <span className="block font-semibold text-sm sm:text-base truncate">Create Order</span>
              <span className="block text-xs opacity-90 truncate sm:whitespace-normal">Start new table order</span>
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/waiter/operations'}
            className="h-24 justify-start gap-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg w-full"
          >
            <Clock className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-left min-w-0">
              <span className="block font-semibold text-sm sm:text-base truncate text-gray-900 dark:text-white">Operations</span>
              <span className="block text-xs text-gray-600 dark:text-gray-400 truncate sm:whitespace-normal">Kitchen, orders & serving</span>
            </span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Tables"
            value={occupiedTables}
            icon={Users}
            color="text-amber-600"
          />
          <StatCard
            title="Active Orders"
            value={activeOrders.length}
            icon={Clock}
            color="text-blue-600"
          />
          <StatCard
            title="Ready to Serve"
            value={readyOrders.length}
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard
            title="Completed Today"
            value={completedOrders.length}
            icon={Activity}
            color="text-purple-600"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Tables"
            value={availableTables}
            icon={Users}
            color="text-green-600"
          />
          <StatCard
            title="Pending Orders"
            value={pendingOrders.length}
            icon={Clock}
            color="text-yellow-600"
          />
          <StatCard
            title="Customer Requests"
            value={requestsData.filter(r => r.status === 'pending').length}
            icon={Bell}
            color="text-red-600"
          />
          <StatCard
            title="Total Revenue"
            value={`$${statsData?.totalRevenue?.toFixed(2) || '0.00'}`}
            icon={DollarSign}
            color="text-emerald-600"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Orders Today (Hourly)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                  <XAxis dataKey="hour" stroke="currentColor" className="text-gray-600 dark:text-gray-400" />
                  <YAxis stroke="currentColor" className="text-gray-600 dark:text-gray-400" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="url(#gradientLine)" 
                    strokeWidth={3}
                    name="Orders"
                  />
                  <defs>
                    <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Table Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tableStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-gray-600 dark:text-gray-400" />
                  <YAxis stroke="currentColor" className="text-gray-600 dark:text-gray-400" />
                  <Tooltip />
                  <Bar dataKey="value" fill="url(#gradientBar)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="gradientBar" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Daily Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Tables Served</span>
                <span className="font-semibold text-gray-900 dark:text-white">{statsData?.tablesServed || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Average Service Time</span>
                <span className="font-semibold text-gray-900 dark:text-white">{statsData?.averageServiceTime || 0} min</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total Orders</span>
                <span className="font-semibold text-gray-900 dark:text-white">{statsData?.totalOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
                <span className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">${statsData?.totalRevenue?.toFixed(2) || '0.00'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Table Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tablesData.map((table) => {
                const status = getTableStatus(table.id)
                return (
                  <TableCard
                    key={table.id}
                    table={table}
                    status={status}
                    onClick={() => handleCreateOrder(table)}
                    onAddOrder={() => handleCreateOrder(table)}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Customer Requests */}
        {requestsData.filter(r => r.status === 'pending').length > 0 && (
          <Card className="bg-gradient-to-r from-red-50/70 to-orange-50/70 dark:from-red-900/20 dark:to-orange-900/20 backdrop-blur-xl border-red-300 dark:border-red-800 shadow-xl shadow-red-500/20 dark:shadow-red-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 dark:text-white">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                Pending Customer Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {requestsData
                  .filter(r => r.status === 'pending')
                  .slice(0, 6)
                  .map((request) => (
                    <CustomerRequestCard
                      key={request.id}
                      request={request}
                      onAccept={() => window.location.href = `/waiter/requests`}
                      onView={() => window.location.href = `/waiter/requests`}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/waiter/orders/active'} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {activeOrders.length === 0 && readyOrders.length === 0 && completedOrders.length === 0 ? (
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl">
                <CardContent className="p-12 text-center text-gray-600 dark:text-gray-400">
                  <div className="h-16 w-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</p>
                  <p className="text-sm">Orders will appear here once created</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {activeOrders.slice(0, 4).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={() => window.location.href = `/waiter/orders/${order.id}`}
                    onEdit={() => window.location.href = `/waiter/orders/${order.id}/edit`}
                  />
                ))}
                {readyOrders.slice(0, 4).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={() => window.location.href = `/waiter/orders/${order.id}`}
                  />
                ))}
                {completedOrders.slice(0, 4).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onView={() => window.location.href = `/waiter/orders/${order.id}`}
                    showActions={false}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </WaiterLayout>
  )
}
