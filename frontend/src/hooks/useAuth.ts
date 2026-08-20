import { useState, useCallback } from 'react'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const login = useCallback(async (email: string, _password: string) => {
    // TODO: Call POST /api/auth/login
    void _password
    console.log('Login placeholder:', email)
    setAuthState((prev) => ({ ...prev, isLoading: false }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setAuthState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  return {
    ...authState,
    login,
    logout,
  }
}
