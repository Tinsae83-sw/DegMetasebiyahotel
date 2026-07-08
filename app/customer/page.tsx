"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import FoodCard from "@/components/customer/food-card"
import CategoryCard from "@/components/customer/category-card"
import { useMenuItems } from "@/hooks/customer/use-menu-items"
import { useCategories } from "@/hooks/customer/use-categories"
import { useRestaurantInfo } from "@/hooks/customer/use-restaurant-info"
import { Search, Sparkles, Clock, Bell, Receipt, Utensils, Star, Flame, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function CustomerHomePage() {
  const searchParams = useSearchParams()
  const tableId = searchParams.get("tableId")
  
  // Store tableId in localStorage for use in cart/order placement
  useEffect(() => {
    if (tableId) {
      localStorage.setItem("tableId", tableId)
    }
  }, [tableId])
  
  const [searchQuery, setSearchQuery] = useState("")
  const { data: menuItems, isLoading: menuLoading } = useMenuItems()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const { data: restaurantInfo } = useRestaurantInfo()

  const popularItems = menuItems?.filter((item) => item.isPopular).slice(0, 4) || []
  const recommendedItems = menuItems?.filter((item) => item.isRecommended).slice(0, 4) || []
  const featuredCategories = categories?.slice(0, 6) || []

  const handleCallWaiter = () => {
    toast.success("Waiter has been called. They will be with you shortly.")
  }

  const handleRequestBill = () => {
    toast.success("Bill request sent to cashier.")
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 dark:from-amber-700 dark:via-orange-700 dark:to-red-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {restaurantInfo?.name || "Welcome to Our Restaurant"}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Experience culinary excellence with our exquisite menu
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/customer/menu${tableId ? `?tableId=${tableId}` : ''}`} className="flex-1">
                <Button size="lg" className="w-full bg-white text-amber-600 hover:bg-white/90">
                  <Utensils className="mr-2 h-5 w-5" />
                  View Menu
                </Button>
              </Link>
              <Link href="/customer/categories" className="flex-1">
                <Button size="lg" variant="outline" className="w-full border-white text-white hover:bg-white/10">
                  Browse Categories
                </Button>
              </Link>
            </div>
            {tableId && (
              <div className="mt-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <MapPin className="h-3 w-3 mr-1" />
                  Table {tableId.slice(0, 8).toUpperCase()}
                </Badge>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for dishes..."
            className="pl-12 h-14 text-lg rounded-full border-amber-200 dark:border-gray-700 focus:ring-amber-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
          <Link href="/customer/categories" className="text-amber-600 dark:text-amber-400 hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoriesLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-40 animate-pulse" />
            ))
          ) : (
            featuredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
                image={category.image}
                itemCount={menuItems?.filter((item) => item.categoryId === category.id).length}
              />
            ))
          )}
        </div>
      </section>

      {/* Today's Specials */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Specials</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {menuLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse" />
            ))
          ) : recommendedItems.length > 0 ? (
            recommendedItems.map((item) => (
              <FoodCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                preparationTime={item.preparationTime}
                isAvailable={item.isAvailable}
                isVegetarian={item.isVegetarian}
                isVegan={item.isVegan}
                isSpicy={item.isSpicy}
                isRecommended={true}
                category={item.category?.name}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No specials available today
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Popular Dishes */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Flame className="h-6 w-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Dishes</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {menuLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-80 animate-pulse" />
            ))
          ) : popularItems.length > 0 ? (
            popularItems.map((item) => (
              <FoodCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                preparationTime={item.preparationTime}
                isAvailable={item.isAvailable}
                isVegetarian={item.isVegetarian}
                isVegan={item.isVegan}
                isSpicy={item.isSpicy}
                isPopular={true}
                category={item.category?.name}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No popular dishes yet
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Promotions Banner */}
      <section>
        <Card className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 border-amber-200 dark:border-amber-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <Badge className="mb-2 bg-amber-500">Special Offer</Badge>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  20% Off All Desserts
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Treat yourself to our delicious desserts at a special price. Valid for today only!
                </p>
              </div>
              <Link href="/customer/menu">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                  Order Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
