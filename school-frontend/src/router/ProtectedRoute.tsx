import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'
import type { JSX } from 'react'

interface Props {
  children: JSX.Element
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, token } = useAuth()

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
