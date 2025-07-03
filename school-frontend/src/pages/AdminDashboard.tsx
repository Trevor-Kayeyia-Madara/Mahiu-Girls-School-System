import { useAuth } from '../context/authContext'
// import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome {user?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">👥 Students</h2>
          <p className="text-3xl font-bold">412</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">👩‍🏫 Teachers</h2>
          <p className="text-3xl font-bold">37</p>
        </div>
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-lg font-semibold">🏫 Classes</h2>
          <p className="text-3xl font-bold">24</p>
        </div>
      </div>

      <div className="bg-white p-4 shadow rounded mt-6">
        <h2 className="text-xl font-semibold mb-2">📢 Recent Announcements</h2>
        <ul className="space-y-2">
          <li className="border-b pb-2">🗓️ Term 2 begins on July 15th</li>
          <li className="border-b pb-2">📣 Staff meeting on Friday</li>
          <li>🔔 New student registration ends this week</li>
        </ul>
      </div>

      <div className="mt-6">
        <a
          href="/admin/reports"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          📊 View Reports
        </a>
      </div>
    </div>
  )
}