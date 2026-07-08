"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Calendar, TrendingUp, DollarSign, ShoppingCart, Users, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { analyticsApi, type SalesByPeriod, type DashboardStats, type TopSellingItem, type CategoryPerformance, type PeakHour } from "@/lib/api/analytics"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d")
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf")
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"day" | "week" | "month" | "year">("day")
  const [isLoadingSales, setIsLoadingSales] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([])
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{ method: string; amount: number; percentage: number }[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    loadSalesByPeriod()
  }, [selectedPeriod])

  useEffect(() => {
    loadAllAnalyticsData()
  }, [dateRange])

  const loadSalesByPeriod = async () => {
    try {
      setIsLoadingSales(true)
      const data = await analyticsApi.getSalesByPeriod(selectedPeriod)
      setSalesByPeriod(data)
    } catch (error) {
      toast.error("Failed to load sales data")
      console.error(error)
    } finally {
      setIsLoadingSales(false)
    }
  }

  const loadAllAnalyticsData = async () => {
    try {
      setIsLoadingData(true)
      
      // Calculate date range based on selection
      const now = new Date()
      let startDate: Date
      switch (dateRange) {
        case '1d':
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          break
        case '7d':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
          break
        case '30d':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 30)
          break
        case '90d':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 90)
          break
        case '1y':
          startDate = new Date(now)
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
      }

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = now.toISOString().split('T')[0]

      const [stats, topItems, categories, hours, payments] = await Promise.all([
        analyticsApi.getDashboardStats(),
        analyticsApi.getTopSellingItems({ limit: 5, startDate: startDateStr, endDate: endDateStr }),
        analyticsApi.getCategoryPerformance({ startDate: startDateStr, endDate: endDateStr }),
        analyticsApi.getPeakHours({ startDate: startDateStr, endDate: endDateStr }),
        analyticsApi.getPaymentMethods({ startDate: startDateStr, endDate: endDateStr }),
      ])

      setDashboardStats(stats)
      setTopSellingItems(topItems)
      setCategoryPerformance(categories)
      setPeakHours(hours)
      setPaymentMethods(payments)
    } catch (error) {
      toast.error("Failed to load analytics data")
      console.error(error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const stats = dashboardStats ? [
    {
      title: "Total Revenue",
      value: `Br${dashboardStats.totalRevenue.toFixed(2)}`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: dashboardStats.totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Average Order Value",
      value: `Br${dashboardStats.averageOrderValue.toFixed(2)}`,
      change: "+3.1%",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      title: "Total Customers",
      value: dashboardStats.totalCustomers.toString(),
      change: "+15.3%",
      icon: Users,
      color: "text-orange-600",
    },
  ] : []


  const handleExport = () => {
    console.log(`Exporting as ${exportFormat}`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Export PDF</SelectItem>
                <SelectItem value="excel">Export Excel</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Sales by Period Cards */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Total Sales by Period</CardTitle>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSales ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : salesByPeriod ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    Br{salesByPeriod.totalRevenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPeriod === 'day' ? 'Today' : selectedPeriod === 'week' ? 'This week' : selectedPeriod === 'month' ? 'This month' : 'This year'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {salesByPeriod.totalOrders}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {salesByPeriod.totalOrders > 0 ? `Avg: Br${(salesByPeriod.totalRevenue / salesByPeriod.totalOrders).toFixed(2)}` : 'No orders'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {isLoadingData ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                  {stat.change} from previous period
                </p>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Sales Chart Placeholder */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Sales chart will be rendered here</p>
                  <p className="text-sm">Integrate Recharts for visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : topSellingItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="space-y-4">
                  {topSellingItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="font-medium">Br{item.revenue.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : categoryPerformance.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryPerformance.map((category, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.categoryName}</span>
                        <span className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{category.orders} orders</span>
                        <span>Br{category.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : peakHours.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="space-y-3">
                  {peakHours.slice(0, 5).map((hour, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{hour.hour}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${(hour.orders / Math.max(...peakHours.map(h => h.orders))) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{hour.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No data available
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((payment, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payment.method}</p>
                        <p className="text-sm text-muted-foreground">{payment.percentage.toFixed(1)}% of total</p>
                      </div>
                      <div className="font-medium">Br{payment.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Custom Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <span>Daily Sales Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Inventory Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Customer Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>Performance Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <DollarSign className="h-6 w-6" />
                <span>Revenue Report</span>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>Staff Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
