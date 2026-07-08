"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { User } from "@/types"
import { getAuthState, clearAuthState, setAuthState as saveAuthState } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState(getAuthState())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAuthState(getAuthState())
    setLoading(false)
  }, [])

  const login = (token: string, user: User) => {
    saveAuthState(token, user)
    setAuthState({ user, token, isAuthenticated: true })
  }

  const logout = () => {
    clearAuthState()
    setAuthState({ user: null, token: null, isAuthenticated: false })
  }

  const value: AuthContextType = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    loading
  }

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
