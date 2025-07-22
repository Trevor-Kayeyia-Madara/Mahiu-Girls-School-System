import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/users', label: '👤 Users' },
    { to: '/admin/students', label: '🎓 Students' },
    { to: '/admin/teachers', label: '🧑‍🏫 Teachers' },
    { to: '/admin/assignments', label: '📚 Classes' },
    { to: '/admin/classrooms', label: '🏫 Classrooms' },
    { to: '/admin/subjects', label: '📘 Subjects' },
    { to: '/admin/grades', label: '📝 Grades' },
    { to: '/admin/rankings', label: '📝 Rankings' },
    { to: '/admin/timetable', label: '📅 Timetable' },
    { to: '/admin/reports', label: '📄 Reports' },
    { to: '/admin/overall', label: '📄 Overall Grades' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-md">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-wide">🎓 Admin Panel</h2>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-4 py-2 rounded text-sm transition ${
                location.pathname === to
                  ? 'bg-gray-700 text-yellow-400'
                  : 'hover:bg-gray-800 hover:text-yellow-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:text-red-600 text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Welcome, {user?.name || 'Admin'}
            </h1>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
          </div>
          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">
            {user?.name?.[0] || 'A'}
          </div>
        </header>

        {/* Routed Pages */}
        <section className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
