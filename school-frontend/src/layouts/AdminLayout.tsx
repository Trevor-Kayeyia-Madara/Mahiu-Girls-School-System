import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          <Link to="/admin" className="block hover:text-yellow-400">📊 Dashboard</Link>
          <Link to="/admin/users" className="block hover:text-yellow-400">👤 Users</Link>
          <Link to="/admin/students" className="block hover:text-yellow-400">🎓 Students</Link>
          <Link to="/admin/teachers" className="block hover:text-yellow-400">🧑‍🏫 Teachers</Link>
          <Link to="/admin/assignments" className="block hover:text-yellow-400">📚 Classes</Link>
          <Link to="/admin/classrooms" className="block hover:text-yellow-400">🏫 Classrooms</Link>
          <Link to="/admin/subjects" className="block hover:text-yellow-400">📘 Subjects</Link>
          <Link to="/admin/grades" className="block hover:text-yellow-400">📝 Grades</Link>
          <Link to ="/admin/timetable" className="block hover:text-yellow-400">📅 Timetable</Link>
          <Link to="/admin/reports" className="block hover:text-yellow-400">📄 Reports</Link>
          <button onClick={handleLogout} className="mt-4 text-red-400 hover:text-red-600">🚪 Logout</button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-600">Role: {user?.role}</p>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
