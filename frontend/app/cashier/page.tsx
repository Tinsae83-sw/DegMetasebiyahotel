"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CashierLayout } from "@/components/layout/cashier-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useOrders } from "@/hooks/use-orders"
import { useAuth } from "@/hooks/use-auth"
import { useSocket } from "@/hooks/cashier/use-socket"
import { format, differenceInMinutes } from "date-fns"
import { motion } from "framer-motion"
import { 
  Clock, 
  Users, 
  CreditCard, 
  RefreshCw,
  DollarSign,
  Receipt,
  CheckCircle,
  X
} from "lucide-react"
import { toast } from "sonner"

export default function CashierPage() {
  const { user } = useAuth()
  const { orders, refetch, processPayment } = useOrders()
  useSocket(user?.id)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState<string>("")

  const ordersData = orders.data || []

  // Filter orders by status
  const readyOrders = ordersData.filter(
    (order: any) => order.status === "READY" || order.status === "SERVED" || order.status === "COMPLETED"
  )
  const paidOrders = ordersData.filter(
    (order: any) => order.paymentStatus === "PAID"
  )

  // Calculate total amount for pending payments
  const totalAmount = readyOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)

  const getOrderTime = (order: any) => {
    const created = new Date(order.createdAt)
    const now = new Date()
    const minutes = differenceInMinutes(now, created)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    return format(created, "HH:mm")
  }

  const handleProcessPayment = (order: any) => {
    setSelectedOrder(order)
    setPaymentMethod("cash")
    setCashReceived("")
    setPaymentDialogOpen(true)
  }

  const handleConfirmPayment = () => {
    const amount = parseFloat(cashReceived) || selectedOrder.total
    const paymentMethodUpper = paymentMethod.toUpperCase() as "CASH" | "CARD" | "CHAPA"
    processPayment({
      id: selectedOrder.id,
      data: {
        paymentMethod: paymentMethodUpper,
        amount,
        cashReceived: paymentMethod === "cash" ? amount : undefined,
      }
    })
    setPaymentDialogOpen(false)
    setSelectedOrder(null)
  }

  return (
    <CashierLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cashier Dashboard</h1>
            <p className="text-muted-foreground">Process payments and manage orders</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Ready for Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{readyOrders.length}</div>
              <p className="text-xs text-muted-foreground">Orders awaiting payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Br{totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total pending payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <div className="space-y-6">
          {/* Ready for Payment */}
          <div>
            <h2 className="text-xl font-semibold">Orders Ready for Payment</h2>
            {readyOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No orders ready for payment.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mt-4">
                {readyOrders.map((order: any) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-green-500 border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                              <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Order #{order.orderNumber || order.id}</h3>
                                <Badge className="bg-green-500">READY FOR PAYMENT</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>Table {order.tableNumber}</span>
                                </div>
                                {order.waiter && (
                                  <div className="flex items-center gap-1">
                                    <span>Waiter: {order.waiter.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{getOrderTime(order)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="lg" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleProcessPayment(order)}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Process Payment
                          </Button>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.quantity}x</span>
                                <span>{item.name}</span>
                                {item.specialInstructions && (
                                  <Badge variant="outline" className="text-xs">
                                    Special
                                  </Badge>
                                )}
                              </div>
                              <span className="text-muted-foreground">Br{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="p-2 bg-muted rounded text-sm mb-4">
                            <span className="font-medium">Note:</span> {order.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-sm text-muted-foreground">{order.items?.length || 0} items</div>
                          <div className="font-bold text-lg text-green-600">Br{order.total?.toFixed(2) || "0.00"}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Paid Orders */}
          <div>
            <h2 className="text-xl font-semibold">Paid Orders</h2>
            {paidOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No paid orders yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 mt-4">
                {paidOrders.map((order: any) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-blue-500 border-2 opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">Order #{order.orderNumber || order.id}</h3>
                                <Badge className="bg-blue-500">PAID</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>Table {order.tableNumber}</span>
                                </div>
                                {order.waiter && (
                                  <div className="flex items-center gap-1">
                                    <span>Waiter: {order.waiter.name}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{getOrderTime(order)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.quantity}x</span>
                                <span>{item.name}</span>
                              </div>
                              <span className="text-muted-foreground">Br{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-sm text-muted-foreground">{order.items?.length || 0} items</div>
                          <div className="font-bold text-lg text-blue-600">Br{order.total?.toFixed(2) || "0.00"}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Process payment for Order #{selectedOrder?.orderNumber || selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">Br{selectedOrder?.total?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className="flex-1"
                >
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex-1"
                >
                  Card
                </Button>
              </div>
            </div>
            {paymentMethod === "cash" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Received</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border rounded-md"
                />
                {cashReceived && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Change:</span>
                    <span className="font-bold">Br{(parseFloat(cashReceived) - (selectedOrder?.total || 0)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CashierLayout>
  )
}
