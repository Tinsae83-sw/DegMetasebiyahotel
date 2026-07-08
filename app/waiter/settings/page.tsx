"use client"

import { useState, useEffect } from "react"
import { WaiterLayout } from "@/components/layout/waiter-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Moon, 
  Sun, 
  Bell, 
  Volume2, 
  Globe, 
  Save,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

export default function WaiterSettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [language, setLanguage] = useState("en")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [soundVolume, setSoundVolume] = useState(50)

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    const settings = {
      darkMode,
      notifications,
      soundEnabled,
      language,
      autoRefresh,
      soundVolume,
    }
    localStorage.setItem("waiter-settings", JSON.stringify(settings))
    toast.success("Settings saved successfully")
  }

  const handleResetSettings = () => {
    setDarkMode(false)
    setNotifications(true)
    setSoundEnabled(true)
    setLanguage("en")
    setAutoRefresh(true)
    setSoundVolume(50)
    localStorage.removeItem("waiter-settings")
    toast.success("Settings reset to defaults")
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("waiter-settings")
    if (saved) {
      const settings = JSON.parse(saved)
      setDarkMode(settings.darkMode || false)
      setNotifications(settings.notifications !== false)
      setSoundEnabled(settings.soundEnabled !== false)
      setLanguage(settings.language || "en")
      setAutoRefresh(settings.autoRefresh !== false)
      setSoundVolume(settings.soundVolume || 50)
    }
  }, [])

  return (
    <WaiterLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your waiter experience</p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark theme</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new orders and requests</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh data every 30 seconds</p>
                </div>
              </div>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sound */}
        <Card>
          <CardHeader>
            <CardTitle>Sound</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            {soundEnabled && (
              <div className="space-y-2">
                <Label>Volume: {soundVolume}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleSaveSettings} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleResetSettings}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </WaiterLayout>
  )
}
