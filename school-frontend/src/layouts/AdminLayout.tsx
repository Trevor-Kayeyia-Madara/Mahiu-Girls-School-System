/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User, UserCircle, Settings } from 'lucide-react'
import clsx from 'clsx'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as any).contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊' },
    { to: '/admin/users', label: 'Users', icon: '👤' },
    { to: '/admin/students', label: 'Students', icon: '🎓' },
    { to: '/admin/teachers', label: 'Teachers', icon: '🧑‍🏫' },
    { to: '/admin/assignments', label: 'Classes', icon: '📚' },
    { to: '/admin/classrooms', label: 'Classrooms', icon: '🏫' },
    { to: '/admin/subjects', label: 'Subjects', icon: '📘' },
    { to: '/admin/grades', label: 'Grades', icon: '📝' },
    { to: '/admin/rankings', label: 'Rankings', icon: '🏆' },
    { to: '/admin/timetable', label: 'Timetable', icon: '📅' },
    { to: '/admin/reports', label: 'Reports', icon: '📄' },
    { to: '/admin/overall', label: 'Overall Grades', icon: '📈' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shadow-md">
        <div className="p-4 mb-4">
          <h2 className="text-xl font-semibold tracking-wide">🎓 Admin</h2>
        </div>

        <nav className="flex-1 space-y-1 px-4 pb-4">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center px-3 py-2 rounded text-sm transition group relative',
                location.pathname === to
                  ? 'bg-gray-700 text-yellow-400'
                  : 'hover:bg-gray-800 hover:text-yellow-300'
              )}
            >
              <span className="text-lg mr-2">{icon}</span>
              <span className="truncate">{label}</span>
              <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 z-10 transition whitespace-nowrap">
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center relative">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Welcome, {user?.name || 'Admin'}
            </h1>
            <p className="text-sm text-gray-500">Role: {user?.role}</p>
          </div>

          {/* Avatar Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="hover:opacity-90 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="User Menu"
            >
              <UserCircle className="w-10 h-10 text-yellow-500" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ul className="py-1">
                  <li>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigate('/admin/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">User Profile</h2>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <div className="mt-6 text-right">
                <button
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Routed Content */}
        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
