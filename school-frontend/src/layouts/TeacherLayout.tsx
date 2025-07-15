import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TeacherLayout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-blue-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">📘 Teacher Panel</h2>
        <nav className="space-y-2">
          <NavLink to="/teacher" className="block hover:underline">Dashboard</NavLink>
          <NavLink to="/teacher/timetable" className="block hover:underline">My Timetable</NavLink>
          <NavLink to="/teacher/grades" className="block hover:underline">Enter Grades</NavLink>
          {/* Add more links here later */}
        </nav>
        <button onClick={logout} className="mt-6 bg-red-600 px-4 py-1 rounded">Logout</button>
      </aside>
      <main className="flex-1 bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  )
}
