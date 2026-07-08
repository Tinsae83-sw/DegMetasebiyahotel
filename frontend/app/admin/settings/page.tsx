"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { settingsApi, type RestaurantSettings } from "@/lib/api/settings"

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    openingHours: {
      monday: { open: "09:00", close: "22:00", isOpen: true },
      tuesday: { open: "09:00", close: "22:00", isOpen: true },
      wednesday: { open: "09:00", close: "22:00", isOpen: true },
      thursday: { open: "09:00", close: "22:00", isOpen: true },
      friday: { open: "09:00", close: "23:00", isOpen: true },
      saturday: { open: "10:00", close: "23:00", isOpen: true },
      sunday: { open: "10:00", close: "21:00", isOpen: true },
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data: any = await settingsApi.get()
      
      // Transform database response to match frontend structure
      const transformedSettings: RestaurantSettings = {
        openingHours: {
          monday: { open: data.mondayOpen || "09:00", close: data.mondayClose || "22:00", isOpen: data.mondayIsOpen ?? true },
          tuesday: { open: data.tuesdayOpen || "09:00", close: data.tuesdayClose || "22:00", isOpen: data.tuesdayIsOpen ?? true },
          wednesday: { open: data.wednesdayOpen || "09:00", close: data.wednesdayClose || "22:00", isOpen: data.wednesdayIsOpen ?? true },
          thursday: { open: data.thursdayOpen || "09:00", close: data.thursdayClose || "22:00", isOpen: data.thursdayIsOpen ?? true },
          friday: { open: data.fridayOpen || "09:00", close: data.fridayClose || "23:00", isOpen: data.fridayIsOpen ?? true },
          saturday: { open: data.saturdayOpen || "10:00", close: data.saturdayClose || "23:00", isOpen: data.saturdayIsOpen ?? true },
          sunday: { open: data.sundayOpen || "10:00", close: data.sundayClose || "21:00", isOpen: data.sundayIsOpen ?? true },
        },
      }
      
      setSettings(transformedSettings)
    } catch (error) {
      toast.error("Failed to load settings")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Transform data to match database schema
      const dbData: any = {}

      // Add opening hours
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      days.forEach((day) => {
        dbData[`${day}Open`] = settings.openingHours[day].open
        dbData[`${day}Close`] = settings.openingHours[day].close
        dbData[`${day}IsOpen`] = settings.openingHours[day].isOpen
      })

      await settingsApi.update(dbData)
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Restaurant Settings</h1>
          <Button onClick={handleSubmit} disabled={isSaving || isLoading}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Opening Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day) => (
                <div key={day} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="capitalize">{day}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.openingHours[day as keyof typeof settings.openingHours].isOpen}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        openingHours: {
                          ...settings.openingHours,
                          [day]: { ...settings.openingHours[day as keyof typeof settings.openingHours], isOpen: checked }
                        }
                      })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {settings.openingHours[day as keyof typeof settings.openingHours].isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  <Input
                    type="time"
                    value={settings.openingHours[day as keyof typeof settings.openingHours].open}
                    onChange={(e) => setSettings({
                      ...settings,
                      openingHours: {
                        ...settings.openingHours,
                        [day]: { ...settings.openingHours[day as keyof typeof settings.openingHours], open: e.target.value }
                      }
                    })}
                    disabled={!settings.openingHours[day as keyof typeof settings.openingHours].isOpen}
                  />
                  <Input
                    type="time"
                    value={settings.openingHours[day as keyof typeof settings.openingHours].close}
                    onChange={(e) => setSettings({
                      ...settings,
                      openingHours: {
                        ...settings.openingHours,
                        [day]: { ...settings.openingHours[day as keyof typeof settings.openingHours], close: e.target.value }
                      }
                    })}
                    disabled={!settings.openingHours[day as keyof typeof settings.openingHours].isOpen}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

        </form>
        )}
      </div>
    </AdminLayout>
  )
}
