import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../app/AuthContext'

type Props = {
  children: ReactNode
  role?: 'owner' | 'tenant'
}

export function RequireAuth({ children, role }: Props) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && profile?.role !== role) {
    if (profile?.role === 'tenant') {
      return <Navigate to="/tenant/portal" replace />
    }
    if (profile?.role === 'owner') {
      return <Navigate to="/owner/dashboard" replace />
    }
    return <div className="p-6">Not authorized.</div>
  }

  return <>{children}</>
}
