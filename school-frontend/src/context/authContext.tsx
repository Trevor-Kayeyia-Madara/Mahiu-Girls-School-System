/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from "jwt-decode";

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'teacher' | 'student'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const decodeUserFromToken = (token: string): User | null => {
  try {
    const decoded: any = jwtDecode(token)
    return {
      id: decoded.user_id,
      name: decoded.name, // add `name` in token when issuing if needed
      email: decoded.email,
      role: decoded.role
    }
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
       const decodedUser = decodeUserFromToken(token)
      setUser(decodedUser)
    }
    setLoaded(true)
  }, [token])

  if (!loaded) return null  // or a loading spinner

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('http://localhost:5001/api/v1/auth/login', { email, password })
      const { token, user } = res.data

      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
