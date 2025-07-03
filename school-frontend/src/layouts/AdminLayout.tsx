import type { ReactNode } from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router-dom'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white p-4 space-y-6">
        <h2 className="text-2xl font-bold">🛠 Admin</h2>
        <nav className="flex flex-col gap-2">
          <a href="/admin/dashboard" className="hover:underline">Dashboard</a>
          <a href="/admin/students" className="hover:underline">Manage Students</a>
          <a href="/admin/staff" className="hover:underline">Manage Staff</a>
          <a href="/admin/classrooms" className="hover:underline">Manage Classes</a>
          <a href="/admin/reports" className="hover:underline">Reports</a>
        </nav>
        <button onClick={handleLogout} className="mt-6 bg-red-500 px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="text-sm text-gray-500 mb-4">Logged in as {user?.email}</div>
        {children}
      </main>
    </div>
  )
}
