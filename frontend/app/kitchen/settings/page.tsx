"use client"

import { KitchenLayout } from "@/components/layout/kitchen-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell, 
  Monitor, 
  Moon, 
  Languages, 
  RefreshCw, 
  Layout,
  Maximize2,
  Volume2
} from "lucide-react"
import { useKitchenSettings } from "@/hooks/kitchen/use-kitchen-settings"
import { useTheme } from "@/components/providers/theme-provider"
import { toast } from "sonner"

export default function KitchenSettingsPage() {
  const { settings, updateSettings, isUpdating } = useKitchenSettings()
  const { theme, setTheme } = useTheme()

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value })
  }

  return (
    <KitchenLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Customize your kitchen display experience
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificationSound">Notification Sound</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound for new orders
                  </p>
                </div>
                <Switch
                  id="notificationSound"
                  checked={settings?.notificationSound || false}
                  onCheckedChange={(checked) => handleSettingChange('notificationSound', checked)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="soundVolume">Sound Volume</Label>
                  <p className="text-sm text-muted-foreground">
                    Adjust notification volume
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="fullScreen">Full Screen Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use full screen for kitchen displays
                  </p>
                </div>
                <Switch
                  id="fullScreen"
                  checked={settings?.fullScreenMode || false}
                  onCheckedChange={(checked) => handleSettingChange('fullScreenMode', checked)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayDensity">Display Density</Label>
                <Select
                  value={settings?.displayDensity || "NORMAL"}
                  onValueChange={(value) => handleSettingChange('displayDensity', value)}
                >
                  <SelectTrigger disabled={isUpdating}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPACT">Compact</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="COMFORTABLE">Comfortable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings?.language || "en"}
                  onValueChange={(value) => handleSettingChange('language', value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoRefresh">Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh orders
                  </p>
                </div>
                <Switch
                  id="autoRefresh"
                  checked={settings?.autoRefresh || false}
                  onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                  disabled={isUpdating}
                />
              </div>

              {settings?.autoRefresh && (
                <div className="space-y-2 pl-4 border-l-2">
                  <Label htmlFor="refreshInterval">Refresh Interval</Label>
                  <Select
                    value={settings?.refreshInterval?.toString() || "30"}
                    onValueChange={(value) => handleSettingChange('refreshInterval', parseInt(value))}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kitchen Station */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                Default Station
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultStation">Default Kitchen Station</Label>
                <Select
                  value={settings?.defaultStation || "all"}
                  onValueChange={(value) => handleSettingChange('defaultStation', value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    <SelectItem value="GRILL">Grill</SelectItem>
                    <SelectItem value="PIZZA">Pizza</SelectItem>
                    <SelectItem value="PASTA">Pasta</SelectItem>
                    <SelectItem value="SALAD">Salad</SelectItem>
                    <SelectItem value="DRINKS">Drinks</SelectItem>
                    <SelectItem value="DESSERTS">Desserts</SelectItem>
                    <SelectItem value="COFFEE">Coffee</SelectItem>
                    <SelectItem value="BAKERY">Bakery</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Set your default station for filtering orders
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        Reset Button
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reset All Settings</p>
                <p className="text-sm text-muted-foreground">
                  Restore all settings to default values
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  handleSettingChange('notificationSound', true)
                  handleSettingChange('fullScreenMode', false)
                  setTheme('light')
                  handleSettingChange('language', 'en')
                  handleSettingChange('autoRefresh', true)
                  handleSettingChange('refreshInterval', 30)
                  handleSettingChange('displayDensity', 'NORMAL')
                  toast.success('Settings reset to defaults')
                }}
                disabled={isUpdating}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </KitchenLayout>
  )
}
