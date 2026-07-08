"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface KitchenAuthGuardProps {
  children: React.ReactNode
}

const KITCHEN_ROLES = ["KITCHEN", "ADMIN"]

export function KitchenAuthGuard({ children }: KitchenAuthGuardProps) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && !KITCHEN_ROLES.includes(user.role)) {
        router.push("/login")
      }
    }
  }, [isAuthenticated, user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!isAuthenticated || (user && !KITCHEN_ROLES.includes(user.role))) {
    return null
  }

  return <>{children}</>
}
