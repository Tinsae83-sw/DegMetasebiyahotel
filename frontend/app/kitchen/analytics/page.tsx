"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenStatCard } from "@/components/kitchen/kitchen-stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Activity, 
  Calendar,
  Download
} from "lucide-react"
import { useKitchenPerformance } from "@/hooks/kitchen/use-kitchen-performance"
import { useKitchenStats } from "@/hooks/kitchen/use-kitchen-stats"
import { format, subDays, subMonths } from "date-fns"

export default function KitchenAnalyticsPage() {
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "year">("week")
  const { stats } = useKitchenStats()

  // Calculate date range for performance data
  const getStartDate = () => {
    const now = new Date()
    switch (dateRange) {
      case "today":
        return format(now, "yyyy-MM-dd")
      case "week":
        return format(subDays(now, 7), "yyyy-MM-dd")
      case "month":
        return format(subMonths(now, 1), "yyyy-MM-dd")
      case "year":
        return format(subMonths(now, 12), "yyyy-MM-dd")
      default:
        return format(subDays(now, 7), "yyyy-MM-dd")
    }
  }

  const { performance } = useKitchenPerformance(getStartDate(), format(new Date(), "yyyy-MM-dd"))

  // Mock data for charts (replace with actual API data)
  const hourlyOrdersData = [
    { hour: "9AM", orders: 5 },
    { hour: "10AM", orders: 12 },
    { hour: "11AM", orders: 25 },
    { hour: "12PM", orders: 45 },
    { hour: "1PM", orders: 38 },
    { hour: "2PM", orders: 20 },
    { hour: "3PM", orders: 15 },
    { hour: "4PM", orders: 18 },
    { hour: "5PM", orders: 22 },
    { hour: "6PM", orders: 35 },
    { hour: "7PM", orders: 42 },
    { hour: "8PM", orders: 28 },
  ]

  const preparationTimeData = [
    { name: "Grill", avgTime: 15 },
    { name: "Pizza", avgTime: 20 },
    { name: "Pasta", avgTime: 12 },
    { name: "Salad", avgTime: 8 },
    { name: "Drinks", avgTime: 5 },
    { name: "Desserts", avgTime: 10 },
  ]

  const orderStatusData = [
    { name: "Completed", value: 65, color: "#22c55e" },
    { name: "Preparing", value: 15, color: "#a855f7" },
    { name: "Ready", value: 10, color: "#3b82f6" },
    { name: "Pending", value: 8, color: "#eab308" },
    { name: "Cancelled", value: 2, color: "#ef4444" },
  ]

  const weeklyTrendData = [
    { day: "Mon", orders: 45, completed: 42 },
    { day: "Tue", orders: 52, completed: 48 },
    { day: "Wed", orders: 48, completed: 45 },
    { day: "Thu", orders: 60, completed: 55 },
    { day: "Fri", orders: 75, completed: 70 },
    { day: "Sat", orders: 85, completed: 80 },
    { day: "Sun", orders: 70, completed: 65 },
  ]

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting analytics data...")
  }

  return (
    <KitchenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Kitchen Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Performance metrics and insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KitchenStatCard
            title="Orders Today"
            value={stats?.ordersCompletedToday || 0}
            icon={Activity}
            color="text-blue-600"
            delay={0}
          />
          <KitchenStatCard
            title="Avg. Cook Time"
            value={`${stats?.averagePreparationTime || 0}m`}
            icon={Clock}
            color="text-orange-600"
            delay={0.1}
          />
          <KitchenStatCard
            title="Completion Rate"
            value={`${performance?.completionRate || 0}%`}
            icon={CheckCircle}
            color="text-green-600"
            delay={0.2}
          />
          <KitchenStatCard
            title="Efficiency"
            value={`${performance?.kitchenEfficiency || 0}%`}
            icon={TrendingUp}
            color="text-purple-600"
            delay={0.3}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hourly Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Orders by Hour</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Preparation Time by Station */}
          <Card>
            <CardHeader>
              <CardTitle>Avg. Preparation Time by Station</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={preparationTimeData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="avgTime" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Order Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Fastest Preparation</p>
                <p className="text-2xl font-bold text-blue-600">
                  {performance?.fastestPreparation || 0} min
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Slowest Preparation</p>
                <p className="text-2xl font-bold text-red-600">
                  {performance?.slowestPreparation || 0} min
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Peak Hour</p>
                <p className="text-2xl font-bold text-green-600">
                  12PM - 1PM
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">
                  {performance?.ordersToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </KitchenLayout>
  )
}
