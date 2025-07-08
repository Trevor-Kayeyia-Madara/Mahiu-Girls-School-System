import type{ ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-700">📚 Teacher Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-600 text-white p-3 flex gap-6 text-sm">
        <Link
          to="/teacher/dashboard"
          className="hover:underline"
        >
          🏠 Dashboard
        </Link>
        <Link
          to="/teacher/grades"
          className="hover:underline"
        >
          📊 Grades
        </Link>
        <Link
          to="/teacher/messages"
          className="hover:underline"
        >
          ✉️ Messages
        </Link>
        <Link
          to="/teacher/timetable"
          className="hover:underline"
        >
          🗓️ Timetable
        </Link>
      </nav>

      {/* Page Content */}
      <main className="p-6 flex-1">{children}</main>
    </div>
  )
}
