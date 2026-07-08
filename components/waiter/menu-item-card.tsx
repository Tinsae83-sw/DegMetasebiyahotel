"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Star, Plus, Minus } from "lucide-react"
import { MenuItem } from "@/types/waiter"
import { motion } from "framer-motion"
import Image from "next/image"

interface MenuItemCardProps {
  item: MenuItem
  quantity?: number
  onAdd?: () => void
  onRemove?: () => void
  onClick?: () => void
  showQuantity?: boolean
}

export function MenuItemCard({ 
  item, 
  quantity = 0, 
  onAdd, 
  onRemove, 
  onClick,
  showQuantity = false 
}: MenuItemCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-row sm:flex-col"
        onClick={onClick}
      >
        <div className="relative w-32 h-32 sm:w-full sm:h-48 flex-shrink-0 bg-muted">
          {item.images && item.images[0] ? (
            <Image
              src={item.images[0]}
              alt={item.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
              No Image
            </div>
          )}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs sm:text-lg px-2 sm:px-4 py-1 sm:py-2">
                Unavailable
              </Badge>
            </div>
          )}
          {item.isFeatured && item.isAvailable && (
            <Badge className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-amber-500 text-[10px] sm:text-xs">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              Featured
            </Badge>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
              <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{item.name}</h3>
              <span className="font-bold text-amber-600 text-sm sm:text-base whitespace-nowrap">${item.price.toFixed(2)}</span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
              {item.description}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{item.preparationTime} min</span>
              </div>
              {item.vegetarian && (
                <Badge variant="outline" className="text-green-600 border-green-600 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  Vegetarian
                </Badge>
              )}
              {item.spicy && (
                <Badge variant="outline" className="text-red-600 border-red-600 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                  Spicy
                </Badge>
              )}
            </div>
          </div>

          {showQuantity ? (
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove?.()
                }}
                disabled={quantity === 0}
              >
                <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
              <span className="font-semibold text-sm sm:text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
                onClick={(e) => {
                  e.stopPropagation()
                  onAdd?.()
                }}
                disabled={!item.isAvailable}
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <Button
              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation()
                onAdd?.()
              }}
              disabled={!item.isAvailable}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Add to Order
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
