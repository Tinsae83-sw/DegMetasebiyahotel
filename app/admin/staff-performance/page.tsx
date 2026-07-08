"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Clock, Star, ChefHat, DollarSign, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"

export default function StaffPerformancePage() {
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [staffData, setStaffData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStaffPerformance()
  }, [])

  const fetchStaffPerformance = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get("/analytics/staff-performance")
      setStaffData(response.data)
    } catch (error) {
      console.error("Failed to fetch staff performance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStaff = roleFilter === "all" 
    ? staffData 
    : staffData.filter(s => s.role === roleFilter)

  // Sort and rank staff by order count
  const getOrdersCount = (staff: any) => {
    if (staff.role === "waiter") return staff.ordersServed || 0
    if (staff.role === "kitchen") return staff.ordersPrepared || 0
    if (staff.role === "cashier") return staff.transactions || 0
    return 0
  }

  const sortedStaff = [...staffData].sort((a, b) => getOrdersCount(b) - getOrdersCount(a))
  const rankedStaff = sortedStaff.map((staff, index) => ({ ...staff, rank: index + 1 }))

  const waiters = rankedStaff.filter(s => s.role === "waiter")
  const kitchenStaff = rankedStaff.filter(s => s.role === "kitchen")
  const cashiers = rankedStaff.filter(s => s.role === "cashier")

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-orange-600">🥉 3rd</Badge>
    return <Badge className="bg-gray-200 text-gray-700">#{rank}</Badge>
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Staff Performance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and analyze staff performance metrics
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="waiter">Waiters</SelectItem>
              <SelectItem value="kitchen">Kitchen Staff</SelectItem>
              <SelectItem value="cashier">Cashiers</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchStaffPerformance} variant="outline" size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Waiters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {waiters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No waiter data available</p>
                ) : (
                  waiters.map((waiter) => (
                    <div key={waiter.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{waiter.name}</span>
                        <div className="flex items-center gap-2">
                          {getRankBadge(waiter.rank)}
                          <Badge className="bg-blue-500">Waiter</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{waiter.ordersServed || 0} orders</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{waiter.averageServiceTime || 0}m avg</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{(waiter.customerRating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4" />
                          <span>Br {waiter.totalRevenue?.toFixed(0) || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Kitchen Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kitchenStaff.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No kitchen staff data available</p>
                ) : (
                  kitchenStaff.map((kitchen) => (
                    <div key={kitchen.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{kitchen.name}</span>
                        <div className="flex items-center gap-2">
                          {getRankBadge(kitchen.rank)}
                          <Badge className="bg-orange-500">Kitchen</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ChefHat className="h-4 w-4" />
                          <span>{kitchen.ordersPrepared || 0} orders</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{kitchen.averageCookingTime || 0}m avg</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span>{kitchen.accuracy || 0}% accuracy</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span>{kitchen.delayedOrders || 0} delayed</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cashiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cashiers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No cashier data available</p>
                ) : (
                  cashiers.map((cashier) => (
                    <div key={cashier.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{cashier.name}</span>
                        <div className="flex items-center gap-2">
                          {getRankBadge(cashier.rank)}
                          <Badge className="bg-green-500">Cashier</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4" />
                          <span>Br {cashier.revenueProcessed?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <ShoppingCart className="h-4 w-4" />
                          <span>{cashier.transactions || 0} txns</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{cashier.averageTransactionTime || 0}s avg</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          <span>{cashier.refunds || 0} refunds</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Orders/Txns</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No staff data available
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff: any) => (
                    <TableRow key={staff.id}>
                      <TableCell>{getRankBadge(staff.rank)}</TableCell>
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>
                        <Badge className={
                          staff.role === "waiter" ? "bg-blue-500" :
                          staff.role === "kitchen" ? "bg-orange-500" : "bg-green-500"
                        }>
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {staff.ordersServed || staff.transactions || staff.ordersPrepared || 0}
                      </TableCell>
                      <TableCell>
                        {staff.averageServiceTime || staff.averageCookingTime || staff.averageTransactionTime || 0}
                        {staff.role === "cashier" ? "s" : "m"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {(staff.customerRating || staff.rating || 0).toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          (staff.customerRating || staff.rating || 0) >= 4.5 ? "bg-green-500" :
                          (staff.customerRating || staff.rating || 0) >= 4.0 ? "bg-yellow-500" : "bg-red-500"
                        }>
                          {(staff.customerRating || staff.rating || 0) >= 4.5 ? "Excellent" :
                           (staff.customerRating || staff.rating || 0) >= 4.0 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
      </>
      )}
      </div>
    </AdminLayout>
  )
}
