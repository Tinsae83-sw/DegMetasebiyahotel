"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FoodCard from "@/components/customer/food-card"
import { useMenuItems } from "@/hooks/customer/use-menu-items"
import { useCategories } from "@/hooks/customer/use-categories"
import { Search, Filter, X, Clock, Leaf, Flame, MapPin } from "lucide-react"

export default function CustomerMenuPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const tableId = searchParams.get("tableId")
  
  // Store tableId in localStorage for use in cart/order placement
  useEffect(() => {
    if (tableId) {
      localStorage.setItem("tableId", tableId)
    }
  }, [tableId])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all")
  const [showFilters, setShowFilters] = useState(false)
  const [filterVegetarian, setFilterVegetarian] = useState(false)
  const [filterVegan, setFilterVegan] = useState(false)
  const [filterSpicy, setFilterSpicy] = useState(false)
  const [sortBy, setSortBy] = useState("name")

  const { data: menuItems, isLoading } = useMenuItems()
  const { data: categories } = useCategories()

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])

  const filteredItems = menuItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory
    const matchesVegetarian = !filterVegetarian || item.isVegetarian
    const matchesVegan = !filterVegan || item.isVegan
    const matchesSpicy = !filterSpicy || item.isSpicy
    const matchesAvailability = item.isAvailable

    return matchesSearch && matchesCategory && matchesVegetarian && matchesVegan && matchesSpicy && matchesAvailability
  }) || []

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "time":
        return a.preparationTime - b.preparationTime
      default:
        return 0
    }
  })

  const activeFiltersCount = [filterVegetarian, filterVegan, filterSpicy].filter(Boolean).length

  const clearFilters = () => {
    setFilterVegetarian(false)
    setFilterVegan(false)
    setFilterSpicy(false)
    setSearchQuery("")
    setSelectedCategory("all")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-24">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/10 dark:bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-8 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 dark:from-amber-400 dark:via-amber-300 dark:to-orange-400 bg-clip-text text-transparent">
              Our Menu
            </h1>
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-lg">
              <p>Discover <span className="font-semibold text-amber-700 dark:text-amber-400">{filteredItems.length}</span> exquisite dishes</p>
              {tableId && (
                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  <MapPin className="h-3 w-3 mr-1" />
                  Table {tableId.slice(0, 8).toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-white text-amber-700">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur opacity-20" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <Input
            type="text"
            placeholder="Search for exquisite dishes..."
            className="relative pl-14 h-14 rounded-full border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 focus:ring-2 focus:ring-amber-500/50 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className={`${showFilters ? "block" : "hidden"} md:block`}>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Refine Your Selection</h3>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-white dark:bg-gray-900 border-amber-200 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                    <SelectItem value="time">Preparation Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Filters */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dietary Preferences</label>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={filterVegetarian ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterVegetarian(!filterVegetarian)}
                    className={filterVegetarian ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25" : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}
                  >
                    <Leaf className="h-4 w-4 mr-1" />
                    Vegetarian
                  </Button>
                  <Button
                    variant={filterVegan ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterVegan(!filterVegan)}
                    className={filterVegan ? "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg shadow-green-600/25" : "border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"}
                  >
                    <Leaf className="h-4 w-4 mr-1" />
                    Vegan
                  </Button>
                  <Button
                    variant={filterSpicy ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSpicy(!filterSpicy)}
                    className={filterSpicy ? "bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg shadow-red-500/25" : "border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"}
                  >
                    <Flame className="h-4 w-4 mr-1" />
                    Spicy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl animate-pulse shadow-lg" />
            ))}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-28 w-28 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center shadow-lg">
              <Search className="h-14 w-14 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              No dishes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
              Try adjusting your filters or search terms
            </p>
            <Button onClick={clearFilters} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25">
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-7"
          >
            {sortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FoodCard
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
                  isPopular={item.isPopular}
                  isRecommended={item.isRecommended}
                  category={item.category?.name}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
