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
import { Plus, Search, Edit, Trash2, MapPin, Loader2, Users, QrCode, Download, User, UserX } from "lucide-react"
import QRCode from "react-qr-code"
import { useRooms } from "@/hooks/use-rooms"
import { useStaff } from "@/hooks/use-staff"
import type { Room } from "@/lib/api/rooms"

export default function RoomsPage() {
  const { rooms, createRoom, updateRoom, deleteRoom, toggleActive, generateQR, assignWaiter, removeWaiter, isCreating, isUpdating, isDeleting, isGeneratingQR, isAssigningWaiter, isRemovingWaiter } = useRooms()
  const { staff } = useStaff({ role: "waiter", isActive: true })
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: 10,
    location: "",
    isActive: true,
  })
  const [selectedWaiterId, setSelectedWaiterId] = useState("")

  const filteredRooms = rooms.data?.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.location && room.location.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingRoom) {
      updateRoom({ id: editingRoom.id, data: formData })
    } else {
      createRoom(formData)
    }
    
    setIsDialogOpen(false)
    setEditingRoom(null)
    setFormData({ name: "", description: "", capacity: 10, location: "", isActive: true })
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description || "",
      capacity: room.capacity,
      location: room.location || "",
      isActive: room.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this room? This will also delete all tables in this room.")) {
      deleteRoom(id)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingRoom(null)
    setFormData({ name: "", description: "", capacity: 10, location: "", isActive: true })
  }

  const handleShowQR = (room: Room) => {
    setSelectedRoom(room)
    if (!room.qrCode) {
      generateQR(room.id)
    }
    setQrDialogOpen(true)
  }

  const openAssignDialog = (room: Room) => {
    setSelectedRoom(room)
    setSelectedWaiterId(room.waiter?.id || "")
    setAssignDialogOpen(true)
  }

  const handleAssignWaiter = () => {
    if (!selectedRoom || !selectedWaiterId) return

    assignWaiter({ id: selectedRoom.id, waiterId: selectedWaiterId })
    setAssignDialogOpen(false)
    setSelectedRoom(null)
    setSelectedWaiterId("")
  }

  const handleRemoveWaiter = (room: Room) => {
    if (!room.waiter) return
    removeWaiter(room.id)
  }

  const handleDownloadQR = () => {
    if (!selectedRoom) return
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
      downloadLink.download = `qr-room-${selectedRoom.name}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (rooms.isLoading) {
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
          <h1 className="text-3xl font-bold">Room Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRoom(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Main Hall, Private Room, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the room"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Floor 1, Building A, etc."
                    />
                  </div>
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
                    {editingRoom ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Rooms</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No rooms found. Click "Add Room" to create one.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{room.name}</h3>
                            {room.description && (
                              <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                            )}
                          </div>
                          <Badge variant={room.isActive ? "default" : "secondary"}>
                            {room.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {room.capacity} guests
                          </div>
                          {room.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {room.location}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{room.tables?.length || 0} tables</span>
                        </div>
                        {room.waiter ? (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">{room.waiter.name}</span>
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
                            onClick={() => handleShowQR(room)}
                            disabled={isGeneratingQR}
                          >
                            {isGeneratingQR ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                            QR Code
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignDialog(room)}
                            disabled={isAssigningWaiter}
                          >
                            {isAssigningWaiter ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                            Assign
                          </Button>
                          {room.waiter && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveWaiter(room)}
                              disabled={isRemovingWaiter}
                            >
                              {isRemovingWaiter ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-destructive" />}
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(room)}
                            disabled={isUpdating}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(room.id)}
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
              <DialogTitle>QR Code - {selectedRoom?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <QRCode
                  id="qr-code-svg"
                  value={selectedRoom?.qrCode || `room-${selectedRoom?.id}`}
                  size={200}
                  level="H"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code to view the menu and place orders in this room
              </p>
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
              <DialogTitle>Assign Waiter - {selectedRoom?.name}</DialogTitle>
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
