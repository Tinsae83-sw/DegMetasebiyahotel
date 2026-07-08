"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"

interface KitchenTimerProps {
  startTime: string
  estimatedTime?: number
  isOverdue?: boolean
}

export function KitchenTimer({ startTime, estimatedTime, isOverdue = false }: KitchenTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
      setElapsed(elapsedSeconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!estimatedTime) return 0
    const estimatedSeconds = estimatedTime * 60
    return Math.min((elapsed / estimatedSeconds) * 100, 100)
  }

  const isOverdueTime = estimatedTime && elapsed > estimatedTime * 60

  return (
    <Card className={`${isOverdueTime ? "border-red-500 bg-red-50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={`h-5 w-5 ${isOverdueTime ? "text-red-600" : "text-primary"}`} />
            <span className={`text-2xl font-bold ${isOverdueTime ? "text-red-600" : ""}`}>
              {formatTime(elapsed)}
            </span>
          </div>
          {isOverdueTime && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          )}
        </div>

        {estimatedTime && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.5 }}
              className={`h-2 rounded-full ${
                isOverdueTime ? "bg-red-500" : getProgress() > 80 ? "bg-yellow-500" : "bg-green-500"
              }`}
            />
          </div>
        )}

        {estimatedTime && (
          <p className="text-xs text-muted-foreground mt-2">
            Est. {estimatedTime} min
          </p>
        )}
      </CardContent>
    </Card>
  )
}
