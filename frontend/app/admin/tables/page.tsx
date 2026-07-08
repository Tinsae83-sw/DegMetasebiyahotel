"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, MapPin, QrCode, Download, Loader2, User, UserX } from "lucide-react"
import QRCode from "react-qr-code"
import { useTables } from "@/hooks/use-tables"
import { useStaff } from "@/hooks/use-staff"
import type { Table } from "@/lib/api/tables"

export default function TablesPage() {
  const { tables, createTable, updateTable, deleteTable, generateQR, toggleActive, assignWaiter, removeWaiter, isCreating, isUpdating, isDeleting, isGeneratingQR, isAssigningWaiter, isRemovingWaiter } = useTables()
  const { staff } = useStaff({ role: "waiter", isActive: true })
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [formData, setFormData] = useState({
    number: 0,
    capacity: 4,
    location: "",
    isActive: true,
  })
  const [selectedWaiterId, setSelectedWaiterId] = useState("")

  const filteredTables = tables.data?.filter(table =>
    table.number.toString().includes(searchQuery) ||
    (table.location && table.location.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingTable) {
      updateTable({ id: editingTable.id, data: formData })
    } else {
      createTable(formData)
    }
    
    setIsDialogOpen(false)
    setEditingTable(null)
    setFormData({ number: 0, capacity: 4, location: "", isActive: true })
  }

  const handleEdit = (table: Table) => {
    setEditingTable(table)
    setFormData({
      number: table.number,
      capacity: table.capacity,
      location: table.location || "",
      isActive: table.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this table?")) {
      deleteTable(id)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingTable(null)
    setFormData({ number: 0, capacity: 4, location: "", isActive: true })
  }

  const handleShowQR = (table: Table) => {
    setSelectedTable(table)
    if (!table.qrCode) {
      generateQR(table.id)
    }
    setQrDialogOpen(true)
  }

  const handleAssignWaiter = () => {
    if (selectedTable && selectedWaiterId) {
      assignWaiter({ id: selectedTable.id, waiterId: selectedWaiterId })
      setAssignDialogOpen(false)
      setSelectedWaiterId("")
      setSelectedTable(null)
    }
  }

  const handleRemoveWaiter = (table: Table) => {
    if (confirm("Are you sure you want to remove the waiter from this table?")) {
      removeWaiter(table.id)
    }
  }

  const openAssignDialog = (table: Table) => {
    setSelectedTable(table)
    setSelectedWaiterId(table.waiterId || "")
    setAssignDialogOpen(true)
  }

  const handleDownloadQR = () => {
    if (!selectedTable) return
    const svg = document.getElementById("qr-code-svg")
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `qr-table-${selectedTable.number}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (tables.isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Table Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTable(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTable ? "Edit Table" : "Add New Table"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Table Number</Label>
                    <Input
                      id="number"
                      type="number"
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Main Hall, Terrace, etc."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || isUpdating}>
                    {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingTable ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tables</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tables..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tables found. Click "Add Table" to create one.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredTables.map((table) => (
                  <Card key={table.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold">Table {table.number}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {table.location || "No location"}
                            </div>
                          </div>
                          <Badge variant={table.isActive ? "default" : "secondary"}>
                            {table.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Capacity: {table.capacity} guests
                          </span>
                        </div>
                        {table.waiter ? (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">{table.waiter.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <UserX className="h-4 w-4" />
                            <span>No waiter assigned</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleShowQR(table)}
                            disabled={isGeneratingQR}
                          >
                            {isGeneratingQR ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                            QR Code
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignDialog(table)}
                            disabled={isAssigningWaiter}
                          >
                            {isAssigningWaiter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                            Assign
                          </Button>
                          {table.waiter && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveWaiter(table)}
                              disabled={isRemovingWaiter}
                            >
                              {isRemovingWaiter ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-destructive" />}
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(table)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(table.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code - Table {selectedTable?.number}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  id="qr-code-svg"
                  value="http://10.88.119.82:3000/customer/menu"
                  size={200}
                  level="H"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Scan this QR code to view the menu and place orders at this table
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                  http://10.88.119.82:3000/customer/menu
                </p>
              </div>
              <Button onClick={handleDownloadQR}>
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Waiter Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Waiter - Table {selectedTable?.number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="waiter">Select Waiter</Label>
                <Select value={selectedWaiterId} onValueChange={setSelectedWaiterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a waiter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No waiter</SelectItem>
                    {staff.data?.map((waiter) => (
                      <SelectItem key={waiter.id} value={waiter.id}>
                        {waiter.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssignWaiter} disabled={!selectedWaiterId || isAssigningWaiter}>
                  {isAssigningWaiter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Assign Waiter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
