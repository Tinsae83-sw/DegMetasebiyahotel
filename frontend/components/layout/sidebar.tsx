"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Utensils, 
  Settings, 
  Users, 
  Table as TableIcon, 
  Receipt, 
  ChefHat, 
  ShoppingCart, 
  BarChart3, 
  Bell, 
  User,
  LogOut,
  DoorOpen,
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Categories", href: "/admin/categories", icon: Utensils },
  { name: "Menu Items", href: "/admin/menu", icon: ShoppingCart },
  { name: "Rooms", href: "/admin/rooms", icon: DoorOpen },
  { name: "Tables", href: "/admin/tables", icon: TableIcon },
  { name: "Orders", href: "/admin/orders", icon: Receipt },
  { name: "Staff", href: "/admin/staff", icon: User },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Menu Performance", href: "/admin/menu-performance", icon: Utensils },
  { name: "Staff Performance", href: "/admin/staff-performance", icon: TrendingUp },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Digital Menu</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" suppressHydrationWarning>{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground capitalize" suppressHydrationWarning>{user?.role || "Admin"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full mt-2 justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
