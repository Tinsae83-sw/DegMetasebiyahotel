"use client"

import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useMenuItem, useMenuItems } from "@/hooks/customer/use-menu-items"
import { ArrowLeft, Clock, Leaf, Flame, AlertCircle, Utensils, Star } from "lucide-react"

export default function FoodDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: item, isLoading } = useMenuItem(params.id as string)
  const { data: allItems } = useMenuItems()

  if (isLoading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Item not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const relatedItems = allItems
    ?.filter((i) => i.categoryId === item.categoryId && i.id !== item.id && i.isAvailable)
    .slice(0, 4) || []

  return (
    <div className="space-y-8 pb-24">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Menu
      </Button>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative h-64 md:h-96 rounded-3xl overflow-hidden"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center">
            <span className="text-amber-600 dark:text-amber-400 font-bold text-6xl">{item.name.charAt(0)}</span>
          </div>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-xl">Currently Unavailable</span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.isVegetarian && (
            <Badge className="bg-green-500 hover:bg-green-600">
              <Leaf className="h-3 w-3 mr-1" />
              Vegetarian
            </Badge>
          )}
          {item.isVegan && (
            <Badge className="bg-green-600 hover:bg-green-700">
              <Leaf className="h-3 w-3 mr-1" />
              Vegan
            </Badge>
          )}
          {item.isSpicy && (
            <Badge className="bg-red-500 hover:bg-red-600">
              <Flame className="h-3 w-3 mr-1" />
              Spicy
            </Badge>
          )}
        </div>
        {item.isRecommended && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-amber-500 hover:bg-amber-600">
              <Star className="h-3 w-3 mr-1" />
              Chef's Recommendation
            </Badge>
          </div>
        )}
      </motion.div>

      {/* Item Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {item.name}
            </h1>
            {item.category && (
              <p className="text-amber-600 dark:text-amber-400 font-medium capitalize">
                {item.category.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              Br{item.price.toFixed(2)}
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
          {item.description}
        </p>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4">
          {item.preparationTime && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="h-5 w-5" />
              <span>{item.preparationTime} min</span>
            </div>
          )}
          {item.calories && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Utensils className="h-5 w-5" />
              <span>{item.calories} cal</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Ingredients */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Allergens
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.allergens.map((allergen, index) => (
                <Badge key={index} variant="destructive" className="text-sm">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* Dietary Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Dietary Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={item.isVegetarian ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "opacity-50"}>
              <CardContent className="p-4 text-center">
                <Leaf className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium">Vegetarian</p>
              </CardContent>
            </Card>
            <Card className={item.isVegan ? "border-green-600 bg-green-50 dark:bg-green-900/20" : "opacity-50"}>
              <CardContent className="p-4 text-center">
                <Leaf className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium">Vegan</p>
              </CardContent>
            </Card>
            <Card className={item.isSpicy ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "opacity-50"}>
              <CardContent className="p-4 text-center">
                <Flame className="h-6 w-6 mx-auto mb-2 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium">Spicy</p>
              </CardContent>
            </Card>
            <Card className={item.isAvailable ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "opacity-50"}>
              <CardContent className="p-4 text-center">
                <Utensils className="h-6 w-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-medium">Available</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">You might also like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedItems.map((relatedItem) => (
                <Link key={relatedItem.id} href={`/customer/menu/${relatedItem.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-32">
                      <Image
                        src={relatedItem.image}
                        alt={relatedItem.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm line-clamp-1">{relatedItem.name}</h4>
                      <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                        ${relatedItem.price.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
