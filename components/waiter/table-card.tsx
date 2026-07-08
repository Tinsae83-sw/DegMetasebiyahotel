"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, Plus, MoreVertical } from "lucide-react"
import { Table as TableType, TableStatus } from "@/types/waiter"
import { motion } from "framer-motion"

interface TableCardProps {
  table: TableType
  status: TableStatus
  onClick?: () => void
  onAddOrder?: () => void
  showActions?: boolean
}

const statusColors: Record<TableStatus, string> = {
  available: "bg-gradient-to-r from-emerald-500 to-green-600",
  occupied: "bg-gradient-to-r from-amber-500 to-orange-600",
  reserved: "bg-gradient-to-r from-blue-500 to-indigo-600",
  cleaning: "bg-gradient-to-r from-gray-500 to-slate-600",
}

const statusBorders: Record<TableStatus, string> = {
  available: "border-emerald-300 dark:border-emerald-700",
  occupied: "border-amber-300 dark:border-amber-700",
  reserved: "border-blue-300 dark:border-blue-700",
  cleaning: "border-gray-300 dark:border-gray-700",
}

export function TableCard({ table, status, onClick, onAddOrder, showActions = true }: TableCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10 ${statusBorders[status]}`}
        onClick={onClick}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl text-gray-900 dark:text-white">Table {table.number}</h3>
            <Badge className={`${statusColors[status]} text-white border-0 shadow-lg`}>
              {status}
            </Badge>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium">Capacity: {table.capacity}</span>
            </div>
            {table.location && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium">{table.location}</span>
              </div>
            )}
          </div>

          {showActions && status === 'occupied' && (
            <Button
              size="sm"
              className="w-full mt-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 border-0"
              onClick={(e) => {
                e.stopPropagation()
                onAddOrder?.()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          )}

          {showActions && status === 'available' && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200 dark:border-gray-700 shadow-lg hover:bg-amber-50 dark:hover:bg-amber-900/20"
              onClick={(e) => {
                e.stopPropagation()
                onClick?.()
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Assign Customer
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
