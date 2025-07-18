import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function TeacherLayout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col justify-between py-6 px-4 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold mb-8">📘 Teacher Panel</h2>
          <nav className="space-y-2">
            <NavLink
              to="/teacher"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              🏠 Dashboard
            </NavLink>
            <NavLink
              to="/teacher/timetable"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              📅 My Timetable
            </NavLink>
            <NavLink
              to="/teacher/exam"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              ✍️ Enter Exam
            </NavLink>
            <NavLink
              to="/teacher/teacher-exam"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              📝 Exam Marks
            </NavLink>
            <NavLink
              to="/teacher/grade-summary"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              📈 Overall Grades
            </NavLink>
            <NavLink
              to="/teacher/subjects"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              📚 Assigned Subjects
            </NavLink>
            <NavLink
              to="/teacher/reports"
              className={({ isActive }) =>
                `block px-3 py-2 rounded transition ${
                  isActive ? 'bg-blue-700 font-semibold' : 'hover:bg-blue-700'
                }`
              }
            >
              📄 View Reports
            </NavLink>
          </nav>
        </div>

        <button
          onClick={logout}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 transition text-white py-2 rounded text-center"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
