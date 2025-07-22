// src/layouts/ParentLayout.tsx
import { useNavigate, Link, Outlet } from 'react-router-dom'

export default function ParentLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold border-b border-blue-700">
          👪 Parent Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/parent" className="block hover:bg-blue-700 px-3 py-2 rounded">
            🏠 Dashboard
          </Link>
          <Link to="/parent/reports" className="block hover:bg-blue-700 px-3 py-2 rounded">
            📈 Report Cards
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Content Area */}
      <main className="flex-1 bg-gray-100">
        {/* Top Navbar */}
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-bold text-blue-800">Parent Portal</h1>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
