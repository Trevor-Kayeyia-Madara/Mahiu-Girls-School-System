/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { LogOut, User, X } from 'lucide-react'
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
    { to: '/admin/student-selection', label: 'Student Subject Selection', icon: '🎓' },
    { to: '/admin/teachers', label: 'Teachers', icon: '🧑‍🏫' },
    { to: '/admin/assignments', label: 'Classes', icon: '📚' },
    { to: '/admin/classrooms', label: 'Classrooms', icon: '🏫' },
    { to: '/admin/subjects', label: 'Subjects', icon: '📘' },
    { to: '/admin/grades', label: 'Grades', icon: '📝' },
    { to: '/admin/rankings', label: 'Rankings', icon: '🏆' },
    { to: '/admin/timetable', label: 'Timetable', icon: '📅' },
    { to: '/admin/reports', label: 'Reports', icon: '📄' },
    { to: '/admin/overall', label: 'Overall Grades', icon: '📈' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 bg-gray-900 text-white flex flex-col shadow-md overflow-y-auto max-h-screen">
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

          {/* Floating Avatar Menu */}
          <div className="relative" ref={menuRef}>
            <button
              className="w-10 h-10 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center hover:opacity-90 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="User Menu"
            >
              {user?.name?.[0] || 'A'}
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
                      onClick={() => {
                        setShowProfileModal(true)
                        setMenuOpen(false)
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" /> Profile
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

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </section>
      </main>

      {showProfileModal && (
        <ProfileModal user={user} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  )
}

function ProfileModal({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">👤 Profile</h2>
        <div className="space-y-2">
          <div>
            <span className="text-gray-600 font-medium">Name: </span>
            <span>{user?.name}</span>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Email: </span>
            <span>{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-600 font-medium">Role: </span>
            <span>{user?.role}</span>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
