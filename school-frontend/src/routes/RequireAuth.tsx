import type { JSX } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom"

export default function RequireAuth({ children, role }: { children: JSX.Element, role: string }) {
  const { user } = useAuth()

  if (!user || user.role !== role) {
    return <Navigate to="/login" />
  }

  return children
}
