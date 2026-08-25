import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Redirects unauthenticated users to /login while preserving the
 * intended destination so we can redirect back after login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="app" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p>Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
