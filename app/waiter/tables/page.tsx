"use client"

import { useState, useEffect } from "react"
import { WaiterLayout } from "@/components/layout/waiter-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Clock, 
  QrCode,
  History,
  ArrowRight,
  Merge,
  Split,
  MoreVertical,
  Check,
  X,
  DoorOpen
} from "lucide-react"
import { toast } from "sonner"
import { useTables } from "@/hooks/use-tables"
import { useOrders } from "@/hooks/use-orders"
import { useTableOperations } from "@/hooks/waiter/use-table-operations"
import { TableCard } from "@/components/waiter/table-card"
import { Table, TableStatus } from "@/types/waiter"
import { format } from "date-fns"
import apiClient from "@/lib/api-client"
import { Room } from "@/lib/api/rooms"

export default function TableManagementPage() {
  const { tables } = useTables()
  const { orders } = useOrders()
  const { assignCustomer, releaseTable, transferTable, mergeTables, splitTable } = useTableOperations()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TableStatus | "all">("all")
  const [selectedTable, setSelectedTable] = useState<any>(null)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false)
  const [selectedTablesToMerge, setSelectedTablesToMerge] = useState<string[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(false)

  const tablesData = tables.data || []
  const ordersData = orders.data || []

  // Fetch rooms assigned to waiter
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoadingRooms(true)
        const response = await apiClient.get("/rooms")
        setRooms(response.data)
      } catch (error) {
        console.error("Failed to fetch rooms:", error)
      } finally {
        setIsLoadingRooms(false)
      }
    }
    fetchRooms()
  }, [])

  const getTableStatus = (tableId: string): TableStatus => {
    const tableOrders = ordersData.filter((o: any) => o.tableId === tableId && o.status !== 'completed')
    if (tableOrders.length === 0) return 'available'
    return 'occupied'
  }

  const filteredTables = tablesData.filter(table => {
    const matchesSearch = 
      table.number.toString().includes(searchQuery) ||
      table.location?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const status = getTableStatus(table.id)
    const matchesFilter = statusFilter === 'all' || status === statusFilter || (table as any).status === statusFilter

    return matchesSearch && matchesFilter
  })

  const handleTransfer = (sourceTable: Table, destinationTable: Table) => {
    const currentOrder = ordersData.find((o: any) => (o as any).tableId === sourceTable.id && o.status !== 'completed')
    if (!currentOrder) {
      toast.error('No active order found on this table')
      return
    }

    transferTable.mutate({
      sourceTableId: sourceTable.id,
      sourceTableNumber: sourceTable.number,
      destinationTableId: destinationTable.id,
      destinationTableNumber: destinationTable.number,
      orderId: currentOrder.id,
    })
    setIsTransferDialogOpen(false)
  }

  const handleMerge = () => {
    if (selectedTablesToMerge.length < 2) {
      toast.error('Please select at least 2 tables to merge')
      return
    }

    const destinationTable = tablesData.find(t => t.id === selectedTablesToMerge[0])
    if (!destinationTable) return

    mergeTables.mutate({
      sourceTableIds: selectedTablesToMerge.slice(1),
      destinationTableId: destinationTable.id,
    })
    setIsMergeDialogOpen(false)
    setSelectedTablesToMerge([])
  }

  const handleSplit = (table: Table) => {
    splitTable.mutate({
      tableId: table.id,
      splitCount: 2,
    })
  }

  const getTableOrders = (tableId: string) => {
    return ordersData.filter((o: any) => (o as any).tableId === tableId && o.status !== 'completed')
  }

  return (
    <WaiterLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Table & Room Management</h1>
            <p className="text-muted-foreground">Manage your assigned tables and rooms</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isMergeDialogOpen} onOpenChange={setIsMergeDialogOpen}>
              <DialogTrigger asChild={false}>
                <button 
                  type="button"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Merge className="h-4 w-4 mr-2" />
                  Merge Tables
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Merge Tables</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select tables to merge into one
                  </p>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {tablesData.map(table => (
                      <div
                        key={table.id}
                        className={`p-3 border rounded cursor-pointer transition-colors ${
                          selectedTablesToMerge.includes(table.id)
                            ? 'bg-amber-50 border-amber-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (selectedTablesToMerge.includes(table.id)) {
                            setSelectedTablesToMerge(prev => 
                              prev.filter(id => id !== table.id)
                            )
                          } else {
                            setSelectedTablesToMerge(prev => [...prev, table.id])
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Table {table.number}</span>
                          {selectedTablesToMerge.includes(table.id) && (
                            <Check className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Capacity: {table.capacity} • {table.location || 'No location'}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleMerge} className="w-full">
                    Merge Selected Tables
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Rooms Section */}
        {rooms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-5 w-5" />
                Your Assigned Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{room.name}</h3>
                      <Badge className={room.isActive ? "bg-green-500" : "bg-gray-500"}>
                        {room.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {room.description && (
                      <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} guests</span>
                      </div>
                      {room.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{room.location}</span>
                        </div>
                      )}
                    </div>
                    {room.tables && room.tables.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium mb-2">Tables in this room:</p>
                        <div className="flex flex-wrap gap-2">
                          {room.tables.map((table: any) => (
                            <Badge key={table.id} variant="outline">
                              Table {table.number}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tablesData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {tablesData.filter(t => getTableStatus(t.id) === 'available').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {tablesData.filter(t => getTableStatus(t.id) === 'occupied').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Reserved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {tablesData.filter((t: any) => t.status === 'reserved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredTables.map((table) => {
                const status = getTableStatus(table.id)
                const tableOrders = getTableOrders(table.id)
                
                return (
                  <TableCard
                    key={table.id}
                    table={table}
                    status={status}
                    onClick={() => setSelectedTable(table)}
                    onAddOrder={() => window.location.href = `/waiter/orders/create?tableId=${table.id}`}
                  />
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Table Details Dialog */}
        {selectedTable && (
          <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Table {selectedTable.number} Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Table Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{selectedTable.capacity} guests</span>
                    </div>
                    {selectedTable.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">{selectedTable.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Badge className={getTableStatus(selectedTable.id) === 'available' ? 'bg-green-500' : 'bg-amber-500'}>
                        {getTableStatus(selectedTable.id)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedTable(null)
                        setIsTransferDialogOpen(true)
                      }}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Transfer Table
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleSplit(selectedTable)}
                    >
                      <Split className="h-4 w-4 mr-2" />
                      Split Table
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                {selectedTable.qrCode && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="h-4 w-4" />
                      <span className="font-medium">QR Code</span>
                    </div>
                    <div className="bg-white p-4 rounded inline-block">
                      <img src={selectedTable.qrCode} alt="QR Code" className="w-32 h-32" />
                    </div>
                  </div>
                )}

                {/* Current Order */}
                {getTableOrders(selectedTable.id).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Current Order</h3>
                    {getTableOrders(selectedTable.id).map(order => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium">Order #{(order as any).orderNumber || order.id}</span>
                              <Badge className="ml-2">{order.status}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), 'HH:mm')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {order.items.slice(0, 3).map(item => (
                              <div key={item.id} className="text-sm">
                                {item.quantity}x {item.name}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 font-semibold">
                            Total: ${order.total.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {getTableStatus(selectedTable.id) === 'occupied' && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        releaseTable.mutate(selectedTable.id)
                        setSelectedTable(null)
                      }}
                    >
                      Release Table
                    </Button>
                  )}
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedTable(null)
                      window.location.href = `/waiter/orders/create?tableId=${selectedTable.id}`
                    }}
                  >
                    Create Order
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </WaiterLayout>
  )
}
