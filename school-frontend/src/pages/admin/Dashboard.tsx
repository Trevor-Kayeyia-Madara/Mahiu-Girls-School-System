import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: null,
    students: null,
    teachers: null,
    reports: null,
  })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/dashboard/stats', { headers })
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to load dashboard stats', err))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          📊 Admin Dashboard
        </h2>
        <p className="text-gray-600 text-sm">
          Welcome to the admin panel. Use the navigation menu to manage system modules like users, students, grades, and more.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Users" count={stats.users} color="blue" />
        <Card title="Students" count={stats.students} color="green" />
        <Card title="Teachers" count={stats.teachers} color="purple" />
        <Card title="Reports" count={stats.reports} color="yellow" />
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">👋 Quick Tip</h4>
        <p className="text-sm text-gray-600">
          Use the left sidebar to navigate through system modules. You can manage users, assign teachers to classes, view grades, and generate reports.
        </p>
      </div>
    </div>
  )
}

function Card({ title, count, color }: { title: string; count: number | null; color: string }) {
  return (
    <div className={`bg-gradient-to-tr from-${color}-500 to-${color}-700 text-white p-4 rounded-xl shadow`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{count ?? '...'}</p>
    </div>
  )
}
