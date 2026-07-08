"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, ChefHat, LayoutDashboard, Inbox, CheckCircle, ClipboardCheck, XCircle, BarChart3, User, Settings, Moon, Sun } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { KitchenAuthGuard } from "@/components/kitchen/kitchen-auth-guard"
import { useTheme } from "@/components/providers/theme-provider"

export function KitchenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/kitchen", icon: LayoutDashboard },
    { name: "New Orders", href: "/kitchen/new-orders", icon: Inbox },
    { name: "Cancelled", href: "/kitchen/cancelled", icon: XCircle },
    { name: "Analytics", href: "/kitchen/analytics", icon: BarChart3 },
    { name: "Profile", href: "/kitchen/profile", icon: User },
    { name: "Settings", href: "/kitchen/settings", icon: Settings },
  ]

  return (
    <KitchenAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="lg:hidden border-b bg-white dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="dark:bg-gray-900 dark:border-gray-800">
                <nav className="flex flex-col space-y-2 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-gray-900 dark:text-white">Kitchen Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-64 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800 h-screen sticky top-0">
            <div className="flex items-center gap-2 px-6 py-4 border-b dark:border-gray-800">
              <ChefHat className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <span className="font-semibold text-lg text-gray-900 dark:text-white">Kitchen Portal</span>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t dark:border-gray-800">
              <Button
                variant="outline"
                className="w-full"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </KitchenAuthGuard>
  )
}
