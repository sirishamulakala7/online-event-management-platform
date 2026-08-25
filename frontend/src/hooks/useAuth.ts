import { useState, useCallback, useEffect } from 'react'
import { authApi } from '@/api'
import type { User, AuthResponse } from '@/types'

const STORAGE_KEYS = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'authUser',
} as const

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

function loadStoredAuth(): { user: User | null; accessToken: string | null; refreshToken: string | null } {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken)
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
    const userJson = localStorage.getItem(STORAGE_KEYS.user)
    const user = userJson ? (JSON.parse(userJson) as User) : null
    return { user, accessToken, refreshToken }
  } catch {
    return { user: null, accessToken: null, refreshToken: null }
  }
}

function persistAuth(response: AuthResponse) {
  localStorage.setItem(STORAGE_KEYS.accessToken, response.accessToken)
  localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.user))
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEYS.accessToken)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
  localStorage.removeItem(STORAGE_KEYS.user)
}

function applyAuthResponse(response: AuthResponse): AuthState {
  persistAuth(response)
  return {
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Restore session from localStorage on mount
  useEffect(() => {
    const { user, accessToken } = loadStoredAuth()
    if (user && accessToken) {
      setAuthState({ user, isAuthenticated: true, isLoading: false })
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }, [])

  const handleLogin = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setAuthState(applyAuthResponse(response))
  }, [])

  const handleRegister = useCallback(async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password })
    setAuthState(applyAuthResponse(response))
  }, [])

  const handleLogout = useCallback(() => {
    clearStoredAuth()
    setAuthState({ user: null, isAuthenticated: false, isLoading: false })
  }, [])

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }
}
