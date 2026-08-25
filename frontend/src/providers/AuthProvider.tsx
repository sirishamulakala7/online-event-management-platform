import { AuthContext, type AuthContextValue } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Provides the auth state and actions from useAuth to the entire
 * component tree via AuthContext.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  const value: AuthContextValue = {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
