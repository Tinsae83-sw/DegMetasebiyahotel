import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export function useRestaurantSettings() {
  return useQuery({
    queryKey: ["restaurant-settings"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/settings`)
      return data
    },
  })
}
