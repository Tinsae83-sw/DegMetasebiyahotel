"use client"

import { ChevronRight, Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Breadcrumb() {
  const pathname = usePathname()
  
  const segments = pathname.split("/").filter(Boolean)
  
  const formatSegment = (segment: string) => {
    return segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      <Home className="h-4 w-4" />
      {segments.map((segment, index) => (
        <div key={segment} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          <span
            className={cn(
              "ml-2",
              index === segments.length - 1 && "text-foreground font-medium"
            )}
          >
            {formatSegment(segment)}
          </span>
        </div>
      ))}
    </nav>
  )
}
