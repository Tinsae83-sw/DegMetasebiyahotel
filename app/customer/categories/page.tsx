"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useMenuItems } from "@/hooks/customer/use-menu-items"
import { useCategories } from "@/hooks/customer/use-categories"
import CategoryCard from "@/components/customer/category-card"
import { Utensils } from "lucide-react"

export default function CustomerCategoriesPage() {
  const { data: categories, isLoading } = useCategories()
  const { data: menuItems } = useMenuItems()

  const categoriesWithCount = categories?.map((category) => ({
    ...category,
    itemCount: menuItems?.filter((item) => item.categoryId === category.id && item.isAvailable).length || 0,
  })) || []

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Categories</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our menu by category
        </p>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categoriesWithCount.length === 0 ? (
        <div className="text-center py-16">
          <div className="h-24 w-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Utensils className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No categories available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for our menu categories
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {categoriesWithCount.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <CategoryCard
                id={category.id}
                name={category.name}
                description={category.description}
                image={category.image}
                itemCount={category.itemCount}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
