import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Wraps any route that requires authentication.
 * Redirects to /login if user is not signed in.
 * Shows a loading spinner while session is being resolved.
 */
export default function ProtectedRoute({ children }) {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-islamic-950 pattern-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-islamic-600 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-islamic-400 text-sm font-medium animate-pulse">Memeriksa sesi…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
