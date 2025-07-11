import { Navigate, Outlet } from 'react-router-dom' // Import Outlet
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" />
  // Assuming user.role is defined and correctly reflects the user's role
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />

  // If authorized, render the child routes using Outlet
  return <Outlet />
}