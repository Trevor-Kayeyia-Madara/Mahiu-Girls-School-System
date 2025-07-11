import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { JSX } from 'react'

export default function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />

  return children
}
