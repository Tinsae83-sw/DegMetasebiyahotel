"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Utensils } from "lucide-react"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface TableSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onTableSelected: (tableId: string) => void
}

export default function TableSelectionModal({ isOpen, onClose, onTableSelected }: TableSelectionModalProps) {
  const [tableNumber, setTableNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tables, setTables] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchTables()
    }
  }, [isOpen])

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/tables`)
      setTables(response.data.filter((t: any) => t.isActive))
    } catch (error) {
      console.error("Failed to fetch tables:", error)
    }
  }

  const handleTableSelect = async (tableId: string) => {
    setIsLoading(true)
    try {
      localStorage.setItem("tableId", tableId)
      onTableSelected(tableId)
      onClose()
      toast.success("Table selected successfully")
    } catch (error) {
      toast.error("Failed to select table")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTableNumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tableNumber) {
      toast.error("Please enter a table number")
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/tables`)
      const table = response.data.find((t: any) => t.number === parseInt(tableNumber))
      
      if (!table) {
        toast.error("Table not found")
        return
      }

      localStorage.setItem("tableId", table.id)
      onTableSelected(table.id)
      onClose()
      toast.success(`Table ${tableNumber} selected`)
    } catch (error) {
      toast.error("Failed to find table")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-500" />
            Select Your Table
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Please select your table to continue. This helps us provide better service.
          </p>

          {/* Quick Table Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Available Tables</Label>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((table) => (
                <Button
                  key={table.id}
                  variant="outline"
                  onClick={() => handleTableSelect(table.id)}
                  disabled={isLoading}
                  className="h-12"
                >
                  {table.number}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Table Number Entry */}
          <div className="border-t pt-4">
            <form onSubmit={handleTableNumberSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tableNumber">Or enter table number</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  placeholder="e.g., 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : "Continue"}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
