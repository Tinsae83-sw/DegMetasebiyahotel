"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: string
}

export function StatCard({ title, value, icon: Icon, trend, color = "text-muted-foreground" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-amber-200/50 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/10 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">{title}</CardTitle>
          <div className={`h-9 w-9 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center ${color}`}>
            <Icon className={`h-5 w-5`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last period
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
