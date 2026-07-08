"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Utensils, Star, Moon, Sun, Globe } from "lucide-react"
import CallWaiterButton from "@/components/customer/call-waiter-button"
import RequestBillButton from "@/components/customer/request-bill-button"

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setIsDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "light" : "dark")
  }

  const navigation = [
    { name: "Home", href: "/customer", icon: Home },
    { name: "Menu", href: "/customer/menu", icon: Utensils },
    { name: "Categories", href: "/customer/categories", icon: Utensils },
    { name: "Feedback", href: "/customer/feedback", icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-amber-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          pathname === item.href
                            ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <Link href="/customer" className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hidden sm:block">
                  Restaurant
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const languages = ["en", "am", "om"]
                  const currentIndex = languages.indexOf(language)
                  const nextLanguage = languages[(currentIndex + 1) % languages.length]
                  setLanguage(nextLanguage)
                }}
                className="rounded-full"
              >
                <Globe className="h-5 w-5" />
                <span className="sr-only">Change Language</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-amber-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-amber-200 dark:border-gray-700 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2024 Restaurant. All rights reserved.</p>
            <p className="mt-2">Scan QR code to access our digital menu</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <CallWaiterButton />
      <RequestBillButton />
    </div>
  )
}
