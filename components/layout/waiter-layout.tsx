"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Menu, 
  LogOut, 
  Utensils, 
  LayoutDashboard, 
  Table, 
  PlusCircle, 
  Clock, 
  ChefHat, 
  Bell, 
  UtensilsCrossed, 
  History, 
  BookOpen, 
  User, 
  Settings,
  Moon,
  Sun
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useWaiterRealtimeNotifications } from "@/hooks/waiter/use-waiter-socket"
import { useTheme } from "@/components/providers/theme-provider"

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Table,
  PlusCircle,
  Clock,
  ChefHat,
  Bell,
  UtensilsCrossed,
  History,
  BookOpen,
  User,
  Settings,
}

export function WaiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  
  // Enable real-time notifications for waiters
  useWaiterRealtimeNotifications()

  const navigation = [
    { name: "Create Order", href: "/waiter/orders/create", icon: "PlusCircle" },
    { name: "Operations", href: "/waiter/operations", icon: "Clock" },
    { name: "Requests", href: "/waiter/requests", icon: "Bell" },
    { name: "Menu", href: "/waiter/menu", icon: "BookOpen" },
  ]

  const moreLinks = [
    { name: "Profile", href: "/waiter/profile", icon: "User" },
    { name: "Order History", href: "/waiter/orders/history", icon: "History" },
    { name: "Table", href: "/waiter/tables", icon: "Table" },
  ]

  const isMoreActive = moreLinks.some((item) => pathname === item.href)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 dark:border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <Link href="/waiter" className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold text-gray-900 dark:text-white">Waiter Portal</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const Icon = iconMap[item.icon]
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    isMoreActive
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 dark:bg-gray-800 dark:border-gray-700">
                {moreLinks.map((item) => {
                  const Icon = iconMap[item.icon]
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-md"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="dark:bg-gray-900 dark:border-gray-800">
                <nav className="mt-8 flex flex-col space-y-2">
                  {navigation.map((item) => {
                    const Icon = iconMap[item.icon]
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          pathname === item.href
                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                            : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}

                  <div className="mt-2 border-t pt-2 dark:border-gray-700">
                    {moreLinks.map((item) => {
                      const Icon = iconMap[item.icon]
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                            pathname === item.href
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                              : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={logout} className="gap-1 px-2 sm:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}
