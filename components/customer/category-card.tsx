"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Utensils } from "lucide-react"

interface CategoryCardProps {
  id: string
  name: string
  description?: string
  image?: string
  itemCount?: number
}

export default function CategoryCard({
  id,
  name,
  description,
  image,
  itemCount,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/customer/menu?category=${id}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer border-amber-200 dark:border-gray-700 h-full">
          <div className="relative h-32 overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 flex items-center justify-center">
                <Utensils className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{name}</h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                {description}
              </p>
            )}
            {itemCount !== undefined && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {itemCount} items
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
