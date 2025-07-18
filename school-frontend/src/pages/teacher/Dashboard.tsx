import { useAuth } from "../../contexts/AuthContext"

export default function TeacherDashboard() {
  const { user } = useAuth()

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          👋 Welcome, {user?.name || "Teacher"}
        </h1>
        <p className="text-gray-600 mt-1 text-sm">
          Here's a quick overview of your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold text-blue-800">📅 Upcoming Lessons</h2>
          <p className="text-sm text-gray-700 mt-1">Check your timetable for today’s classes.</p>
        </div>

        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold text-green-800">📝 Exam Entries</h2>
          <p className="text-sm text-gray-700 mt-1">Enter or update marks for recent exams.</p>
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold text-yellow-800">📊 Grade Summary</h2>
          <p className="text-sm text-gray-700 mt-1">View performance and class averages.</p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-1">💡 Tip</h4>
        <p className="text-sm text-gray-600">
          Use the sidebar to navigate your timetable, subjects, and reports easily.
        </p>
      </div>
    </div>
  )
}
