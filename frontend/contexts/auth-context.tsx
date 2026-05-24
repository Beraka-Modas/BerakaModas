"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authService } from '@/lib/api'

// Ajustamos la interfaz a lo que realmente sabemos del usuario
interface User {
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Al cargar la app, verificamos si ya hay un token y un usuario guardado
    const savedUser = authService.getUser()
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    // 1. Llamamos a authService (que hace la petición a Spring Boot y guarda el token)
    await authService.login({ username, password })

    // 2. Una vez exitoso, leemos el usuario que guardó api.ts y actualizamos la pantalla
    const savedUser = authService.getUser()
    setUser(savedUser)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated: !!user, // Si hay usuario, está autenticado
            isLoading,
            login,
            logout
          }}
      >
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}