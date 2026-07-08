"use client"

import { useState } from "react"
import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, ChefHat, Camera, Shield, Save, Key } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import type { KitchenStation } from "@/lib/kitchen/types"

export default function KitchenProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    station: user?.station || "",
    phone: "",
    bio: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleSaveProfile = () => {
    // Implement profile update logic
    toast.success("Profile updated successfully")
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    // Implement password change logic
    toast.success("Password changed successfully")
    setPasswordDialogOpen(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  const STATIONS: { value: KitchenStation; label: string }[] = [
    { value: "GRILL", label: "Grill" },
    { value: "PIZZA", label: "Pizza" },
    { value: "PASTA", label: "Pasta" },
    { value: "SALAD", label: "Salad" },
    { value: "DRINKS", label: "Drinks" },
    { value: "DESSERTS", label: "Desserts" },
    { value: "COFFEE", label: "Coffee" },
    { value: "BAKERY", label: "Bakery" },
  ]

  return (
    <KitchenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your kitchen staff profile
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-orange-600" />
                  </div>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    variant="outline"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {user?.station && (
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.station}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Edit Profile</CardTitle>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="station">Station</Label>
                      <Select
                        value={formData.station}
                        onValueChange={(value) => setFormData({ ...formData, station: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select station" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATIONS.map((station) => (
                            <SelectItem key={station.value} value={station.value}>
                              {station.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Role</Label>
                      <p className="font-medium">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Station</Label>
                      <p className="font-medium">{user?.station || "Not assigned"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>
              <Button variant="outline" onClick={() => setPasswordDialogOpen(true)}>
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </KitchenLayout>
  )
}
