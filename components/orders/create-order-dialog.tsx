"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Minus, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes: string
}

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: any
  menuItems: any[]
  onSuccess: () => void
}

export default function CreateOrderDialog({
  open,
  onOpenChange,
  table,
  menuItems,
  onSuccess,
}: CreateOrderDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = Array.from(new Set(menuItems.map(item => item.categoryId)))

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    const isAvailable = item.isAvailable
    return matchesSearch && matchesCategory && isAvailable
  })

  const addItemToOrder = (menuItem: any) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItem.id)
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          notes: "",
        }
      ])
    }
  }

  const updateItemQuantity = (menuItemId: string, delta: number) => {
    setOrderItems(orderItems.map(item => {
      if (item.menuItemId === menuItem) {
        const newQuantity = Math.max(0, item.quantity + delta)
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const updateItemNotes = (menuItemId: string, notes: string) => {
    setOrderItems(orderItems.map(item =>
      item.menuItemId === menuItem ? { ...item, notes } : item
    ))
  }

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post(`${API_URL}/orders`, {
        tableNumber: table.number,
        tableId: table.id,
        items: orderItems,
        notes,
      })
      toast.success("Order created successfully")
      onOpenChange(false)
      setOrderItems([])
      setNotes("")
      onSuccess()
    } catch (error) {
      toast.error("Failed to create order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Order - Table {table?.number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Menu Items */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search menu items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories.map((catId) => {
                const category = menuItems.find(m => m.categoryId === catId)?.category
                return (
                  <Button
                    key={catId}
                    variant={selectedCategory === catId ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(catId)}
                  >
                    {category?.name || catId}
                  </Button>
                )
              })}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addItemToOrder(item)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                        <p className="text-sm font-semibold text-amber-600">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Order Items</h3>
              {orderItems.length === 0 ? (
                <p className="text-sm text-gray-500">No items added yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orderItems.map((item) => (
                    <Card key={item.menuItemId}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateItemQuantity(item.menuItemId, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => updateItemQuantity(item.menuItemId, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Input
                          placeholder="Special instructions..."
                          value={item.notes}
                          onChange={(e) => updateItemNotes(item.menuItemId, e.target.value)}
                          className="text-sm"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special requests for the kitchen..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || orderItems.length === 0}
                className="flex-1"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
