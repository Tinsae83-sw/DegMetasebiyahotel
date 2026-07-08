"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Star, Leaf, Flame } from "lucide-react"

interface FoodCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  preparationTime?: number
  isAvailable?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isSpicy?: boolean
  isPopular?: boolean
  isRecommended?: boolean
  category?: string
}

export default function FoodCard({
  id,
  name,
  description,
  price,
  image,
  preparationTime,
  isAvailable = true,
  isVegetarian = false,
  isVegan = false,
  isSpicy = false,
  isPopular = false,
  isRecommended = false,
  category,
}: FoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/customer/menu/${id}`}>
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group cursor-pointer border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10">
          <div className="relative h-52 overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 dark:from-amber-900/50 dark:via-orange-900/50 dark:to-amber-800/50 flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 font-bold text-3xl">{name.charAt(0)}</span>
              </div>
            )}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-semibold text-lg tracking-wide">Unavailable</span>
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {isPopular && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              {isRecommended && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Chef's Pick
                </Badge>
              )}
            </div>
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isVegetarian && (
                <Badge variant="secondary" className="bg-emerald-100/90 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/90 dark:hover:bg-emerald-900/70 backdrop-blur-sm border-emerald-200 dark:border-emerald-800">
                  <Leaf className="h-3 w-3 mr-1" />
                  Veg
                </Badge>
              )}
              {isVegan && (
                <Badge variant="secondary" className="bg-green-100/90 dark:bg-green-900/50 text-green-700 dark:text-green-300 hover:bg-green-200/90 dark:hover:bg-green-900/70 backdrop-blur-sm border-green-200 dark:border-green-800">
                  <Leaf className="h-3 w-3 mr-1" />
                  Vegan
                </Badge>
              )}
              {isSpicy && (
                <Badge variant="secondary" className="bg-red-100/90 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200/90 dark:hover:bg-red-900/70 backdrop-blur-sm border-red-200 dark:border-red-800">
                  <Flame className="h-3 w-3 mr-1" />
                  Spicy
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-lg line-clamp-1 text-gray-900 dark:text-white">{name}</h3>
              <span className="font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent whitespace-nowrap">
                Br{price.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
              {preparationTime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">{preparationTime} min</span>
                </div>
              )}
              {category && (
                <span className="capitalize font-medium text-amber-700 dark:text-amber-400">{category}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
