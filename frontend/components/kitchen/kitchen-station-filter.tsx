"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { KitchenStation } from "@/lib/kitchen/types"

interface KitchenStationFilterProps {
  selectedStation?: KitchenStation
  onStationChange: (station?: KitchenStation) => void
}

const STATIONS: { value: KitchenStation; label: string }[] = [
  { value: "GRILL", label: "Grill" },
  { value: "PIZZA", label: "Pizza" },
  { value: "PASTA", label: "Pasta" },
  { value: "SALAD", label: "Salad" },
  { value: "DRINKS", label: "Drinks" },
  { value: "DESSERTS", label: "Desserts" },
  { value: "COFFEE", label: "Coffee" },
  { value: "BAKERY", label: "Bakery" },
]

export function KitchenStationFilter({ selectedStation, onStationChange }: KitchenStationFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Station:</span>
      <Select value={selectedStation || "all"} onValueChange={(value) => onStationChange(value === "all" ? undefined : value as KitchenStation)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stations</SelectItem>
          {STATIONS.map((station) => (
            <SelectItem key={station.value} value={station.value}>
              {station.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
