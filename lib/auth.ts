"use client"

import { User } from "@/types"

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const getAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, token: null, isAuthenticated: false }
  }
  
  const token = localStorage.getItem("token")
  const userJson = localStorage.getItem("user")
  const user = userJson ? JSON.parse(userJson) : null
  
  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  }
}

export const setAuthState = (token: string, user: User) => {
  localStorage.setItem("token", token)
  localStorage.setItem("user", JSON.stringify(user))
}

export const clearAuthState = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const getToken = (): string | null => {
  return localStorage.getItem("token")
}

export const getUser = (): User | null => {
  const userJson = localStorage.getItem("user")
  return userJson ? JSON.parse(userJson) : null
}
