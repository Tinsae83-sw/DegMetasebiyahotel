"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { WaiterLayout } from "@/components/layout/waiter-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, ShoppingCart, Sparkles, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { orderApi } from "@/lib/api/orders"
import { tableApi } from "@/lib/api/tables"
import type { OrderItem } from "@/types/waiter"

const CART_STORAGE_KEY = "waiter-cart"

export default function CreateWaiterOrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<OrderItem[]>([])
  const [tableNumber, setTableNumber] = useState("")
  const [tableId, setTableId] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assignedTables, setAssignedTables] = useState<any[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(true)
  const [isTableAssigned, setIsTableAssigned] = useState(true)

  useEffect(() => {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart) as OrderItem[]
        if (parsedCart.length > 0) {
          setItems(parsedCart)
        }
      } catch {
        console.error("Failed to parse waiter cart")
      }
    }

    const tableIdFromQuery = searchParams.get("tableId") || ""
    const tableNumberFromQuery = searchParams.get("tableNumber") || ""

    if (tableIdFromQuery) setTableId(tableIdFromQuery)
    if (tableNumberFromQuery) setTableNumber(tableNumberFromQuery)

    // Fetch assigned tables
    const fetchAssignedTables = async () => {
      try {
        setIsLoadingTables(true)
        const tables = await tableApi.getAll()
        setAssignedTables(tables)
        
        // Validate if the provided tableId is assigned to this waiter
        if (tableIdFromQuery) {
          const isAssigned = tables.some((t: any) => t.id === tableIdFromQuery)
          setIsTableAssigned(isAssigned)
          if (!isAssigned) {
            toast.error("You are not assigned to this table")
          }
        }
      } catch (error) {
        console.error("Failed to fetch assigned tables:", error)
      } finally {
        setIsLoadingTables(false)
      }
    }
    fetchAssignedTables()
  }, [searchParams])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const updateItemRequirement = (itemId: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, specialInstructions: value } : item))
    )
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // Validate table assignment
    if (tableId) {
      const isAssigned = assignedTables.some((t: any) => t.id === tableId)
      if (!isAssigned) {
        toast.error("You are not assigned to this table. Please select an assigned table.")
        return
      }
    } else {
      const numericTableNumber = Number(tableNumber)
      const isTableNumberAssigned = assignedTables.some((t: any) => t.number === numericTableNumber)
      if (!isTableNumberAssigned) {
        toast.error("You are not assigned to this table. Please select an assigned table.")
        return
      }
    }

    const numericTableNumber = Number(tableNumber)
    if (!numericTableNumber || numericTableNumber <= 0) {
      toast.error("Please enter a valid table number")
      return
    }

    setIsSubmitting(true)

    try {
      await orderApi.create({
        tableNumber: numericTableNumber,
        tableId: tableId || undefined,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.specialInstructions || item.notes || "",
        })),
        notes,
      })

      window.localStorage.removeItem(CART_STORAGE_KEY)
      toast.success("Order submitted successfully")
      router.push("/waiter/orders/active")
    } catch (error: any) {
      console.error("Failed to submit order", error)
      toast.error(error?.response?.data?.error || "Failed to submit order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <WaiterLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Order</h1>
            <p className="text-muted-foreground">Review the cart, add special requests, and submit to the kitchen.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/waiter/menu")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to menu
          </Button>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-medium">No items in the cart yet</p>
              <p className="text-sm text-muted-foreground">Add dishes from the menu first, then return here to submit the order.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            <Badge variant="secondary">x{item.quantity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`requirements-${item.id}`}>Special requirements</Label>
                        <Textarea
                          id={`requirements-${item.id}`}
                          placeholder="e.g. No onions, extra sauce, gluten-free"
                          value={item.specialInstructions || ""}
                          onChange={(event) => updateItemRequirement(item.id, event.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isTableAssigned && tableId && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-800 dark:text-red-200">
                          You are not assigned to this table. Please select an assigned table from the dropdown below.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tableSelect">Select Assigned Table</Label>
                      <Select
                        value={tableId || ""}
                        onValueChange={(value) => {
                          setTableId(value)
                          const selectedTable = assignedTables.find((t: any) => t.id === value)
                          if (selectedTable) {
                            setTableNumber(selectedTable.number.toString())
                            setIsTableAssigned(true)
                          }
                        }}
                        disabled={isLoadingTables}
                      >
                        <SelectTrigger id="tableSelect">
                          <SelectValue placeholder={isLoadingTables ? "Loading tables..." : "Select a table"} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedTables.map((table) => (
                            <SelectItem key={table.id} value={table.id}>
                              Table {table.number} {table.location && `(${table.location})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tableNumber">Table number</Label>
                      <Input
                        id="tableNumber"
                        type="number"
                        min="1"
                        placeholder="Auto-filled from selection"
                        value={tableNumber}
                        onChange={(event) => setTableNumber(event.target.value)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNotes">Order notes</Label>
                    <Textarea
                      id="orderNotes"
                      placeholder="Add any general notes for the kitchen"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={4}
                    />
                  </div>

                  <Card className="bg-muted/40">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (10%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 text-base font-semibold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Submit order to database
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </WaiterLayout>
  )
}
