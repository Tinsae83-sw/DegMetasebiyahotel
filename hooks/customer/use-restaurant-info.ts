import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export interface RestaurantInfo {
  id: string
  name: string
  logo?: string
  coverImage?: string
  description?: string
  address: string
  phone: string
  email: string
  website?: string
  googleMapsLocation?: string
  currency: string
  language: string
  taxPercentage: number
  serviceCharge: number
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  facebook?: string
  instagram?: string
  twitter?: string
  mondayOpen?: string
  mondayClose?: string
  mondayIsOpen?: boolean
  tuesdayOpen?: string
  tuesdayClose?: string
  tuesdayIsOpen?: boolean
  wednesdayOpen?: string
  wednesdayClose?: string
  wednesdayIsOpen?: boolean
  thursdayOpen?: string
  thursdayClose?: string
  thursdayIsOpen?: boolean
  fridayOpen?: string
  fridayClose?: string
  fridayIsOpen?: boolean
  saturdayOpen?: string
  saturdayClose?: string
  saturdayIsOpen?: boolean
  sundayOpen?: string
  sundayClose?: string
  sundayIsOpen?: boolean
  createdAt: string
  updatedAt: string
}

export function useRestaurantInfo() {
  return useQuery({
    queryKey: ["restaurant-info"],
    queryFn: async () => {
      const { data } = await axios.get<RestaurantInfo>(`${API_URL}/settings`)
      return data
    },
  })
}
