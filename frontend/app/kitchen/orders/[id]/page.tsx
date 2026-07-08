"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { KitchenOrderTimeline } from "@/components/kitchen/kitchen-order-timeline"
import { KitchenTimer } from "@/components/kitchen/kitchen-timer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Clock, 
  User, 
  ChefHat, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Utensils,
  MessageSquare
} from "lucide-react"
import { useKitchenOrder } from "@/hooks/kitchen/use-kitchen-orders"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import type { OrderStatus } from "@/lib/kitchen/types"

const SPECIAL_INSTRUCTIONS = [
  "No Spicy", "Extra Spicy", "No Salt", "Extra Cheese", 
  "Gluten Free", "Vegetarian", "Vegan", "Halal"
]

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { user } = useAuth()
  
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [itemNotes, setItemNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const { order, updateStatus, isUpdatingStatus } = useKitchenOrder(orderId)

  const handleStatusUpdate = (status: OrderStatus) => {
    updateStatus(status)
  }

  const handleAddNotes = () => {
    // Implement notes update logic
    toast.success("Notes updated")
    setNotesDialogOpen(false)
    setItemNotes("")
    setSelectedItem(null)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    // Implement rejection logic
    toast.success("Order rejected")
    setRejectDialogOpen(false)
    setRejectionReason("")
    router.back()
  }

  const getSpecialInstructionBadge = (instruction: string) => {
    const colors: Record<string, string> = {
      "No Spicy": "bg-red-100 text-red-800",
      "Extra Spicy": "bg-orange-100 text-orange-800",
      "No Salt": "bg-gray-100 text-gray-800",
      "Extra Cheese": "bg-yellow-100 text-yellow-800",
      "Gluten Free": "bg-blue-100 text-blue-800",
      "Vegetarian": "bg-green-100 text-green-800",
      "Vegan": "bg-green-100 text-green-800",
      "Halal": "bg-purple-100 text-purple-800",
    }
    return colors[instruction] || "bg-gray-100 text-gray-800"
  }

  const normalizeSpecialInstructions = (value: unknown): string[] => {
    if (!value) return []

    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return []
  }

  if (!order.data) {
    return (
      <KitchenLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
        </div>
      </KitchenLayout>
    )
  }

  const orderData = order.data

  return (
    <KitchenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Order #{orderData.orderNumber}</h1>
            <p className="text-muted-foreground mt-1">
              Detailed order information
            </p>
          </div>
          <Badge 
            className={`text-sm px-3 py-1 ${
              orderData.priority === 'URGENT' ? 'bg-red-100 text-red-800 animate-pulse' :
              orderData.priority === 'VIP' ? 'bg-purple-100 text-purple-800' :
              orderData.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {orderData.priority}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Table Number</p>
                    <p className="font-semibold">{orderData.tableNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Type</p>
                    <p className="font-semibold">{orderData.orderType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Waiter</p>
                    <p className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {orderData.waiterName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-semibold">{orderData.customerName || "Guest"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Time</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDistanceToNow(new Date(orderData.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Prep Time</p>
                    <p className="font-semibold">{orderData.estimatedPreparationTime} min</p>
                  </div>
                </div>

                {orderData.specialInstructions && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-900 mb-1">Special Instructions</p>
                    <p className="text-sm text-amber-800">{orderData.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-orange-600">{item.quantity}x</span>
                            <div>
                              <h4 className="font-semibold text-lg">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.station}</p>
                            </div>
                          </div>
                          
                          {item.allergies && item.allergies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.allergies.map((allergy: string, i: number) => (
                                <Badge key={i} variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {(() => {
                            const instructions = normalizeSpecialInstructions(item.specialInstructions)
                            return instructions.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {instructions.map((instruction: string, i: number) => (
                                  <Badge key={i} className={`text-xs ${getSpecialInstructionBadge(instruction)}`}>
                                    {instruction}
                                  </Badge>
                                ))}
                              </div>
                            ) : null
                          })()}

                          {item.notes && (
                            <div className="mt-2 bg-gray-50 rounded p-2">
                              <p className="text-sm text-muted-foreground italic">"{item.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedItem(item)
                            setItemNotes(item.notes || "")
                            setNotesDialogOpen(true)
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Notes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timer */}
            {orderData.status === 'PREPARING' && orderData.startedPreparingAt && (
              <KitchenTimer
                startTime={orderData.startedPreparingAt}
                estimatedTime={orderData.estimatedPreparationTime}
              />
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {orderData.status === 'PENDING' && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusUpdate('ACCEPTED')}
                      disabled={isUpdatingStatus}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Order
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={isUpdatingStatus}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Order
                    </Button>
                  </>
                )}

                {orderData.status === 'ACCEPTED' && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleStatusUpdate('PREPARING')}
                    disabled={isUpdatingStatus}
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Start Preparing
                  </Button>
                )}

                {orderData.status === 'PREPARING' && (
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleStatusUpdate('READY')}
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Ready
                  </Button>
                )}

                {orderData.status === 'READY' && (
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate('COMPLETED')}
                    disabled={isUpdatingStatus}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Order
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <KitchenOrderTimeline
              timeline={[]}
              currentStatus={orderData.status}
            />
          </div>
        </div>

        {/* Notes Dialog */}
        <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Cooking Notes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Add cooking instructions or special requests..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Rejection</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this order..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                  Reject Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  )
}
