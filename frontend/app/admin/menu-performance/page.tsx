"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Star, Clock, Utensils, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"

interface MenuPerformance {
  id: string
  name: string
  category: string
  ordersCount: number
  revenue: number
  averageRating: number
  availability: number
}

export default function MenuPerformancePage() {
  const [menuData, setMenuData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMenuPerformance()
  }, [])

  const fetchMenuPerformance = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get("/analytics/menu-performance")
      setMenuData(response.data)
    } catch (error) {
      console.error("Failed to fetch menu performance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = menuData?.menuItems || []
  const bestSelling = menuData?.bestSelling || []
  const leastSelling = menuData?.leastSelling || []
  const categoryPerformance = menuData?.categoryPerformance || []

  const sortedByOrders = [...menuItems].sort((a: any, b: any) => b.ordersCount - a.ordersCount)
  const sortedByRevenue = [...menuItems].sort((a: any, b: any) => b.revenue - a.revenue)

  return (
    <AdminLayout>
      <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Menu Performance
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze menu item performance and customer preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-end">
          <Button onClick={fetchMenuPerformance} variant="outline" size="icon">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Best Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              {bestSelling.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bestSelling.map((item: any, index: number) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            {item.ordersCount}
                          </div>
                        </TableCell>
                        <TableCell>Br {item.revenue?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {(item.averageRating || 0).toFixed(1)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Least Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              {leastSelling.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leastSelling.map((item: any, index: number) => (
                      <TableRow key={item.id || index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            {item.ordersCount}
                          </div>
                        </TableCell>
                        <TableCell>Br {item.revenue?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {(item.averageRating || 0).toFixed(1)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Avg Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPerformance.map((cat: any, index: number) => (
                    <TableRow key={cat.categoryId || index}>
                      <TableCell className="font-medium">{cat.categoryName}</TableCell>
                      <TableCell>{cat.orders}</TableCell>
                      <TableCell>Br {cat.revenue?.toLocaleString() || 0}</TableCell>
                      <TableCell>{cat.percentage?.toFixed(1) || 0}%</TableCell>
                      <TableCell>Br {cat.orders > 0 ? (cat.revenue / cat.orders).toFixed(2) : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
            <CardTitle>All Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {menuItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No menu items data available</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item: any, index: number) => (
                    <TableRow key={item.id || index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.ordersCount || 0}</TableCell>
                      <TableCell>Br {item.revenue?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {(item.averageRating || 0).toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            (item.availability || 0) >= 90
                              ? "bg-green-500"
                              : (item.availability || 0) >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }
                        >
                          {item.availability || 0}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </>
      )}
      </div>
    </AdminLayout>
  )
}
