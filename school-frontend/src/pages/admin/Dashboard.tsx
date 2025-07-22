import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    teachers: 0,
    reports: 0,
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    axios
      .get('http://localhost:5001/api/v1/dashboard/stats', { headers })
      .then(res => {
        console.log('✅ API Response:', res.data)
        const { users, students, teachers, reports } = res.data
        setStats({ users, students, teachers, reports })
      })
      .catch(err => {
        console.error('❌ Failed to load dashboard stats', err)
      })
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
        <StatCard title="Users" count={stats.users} color="blue" />
        <StatCard title="Students" count={stats.students} color="green" />
        <StatCard title="Teachers" count={stats.teachers} color="purple" />
        <StatCard title="Reports" count={stats.reports} color="yellow" />
      </div>
    </div>
  )
}

function StatCard({
  title,
  count,
  color,
}: {
  title: string
  count: number
  color: 'blue' | 'green' | 'purple' | 'yellow'
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
    yellow: 'from-yellow-500 to-yellow-700',
  }

  return (
    <div className={`bg-gradient-to-tr ${colorMap[color]} text-white p-4 rounded-xl shadow`}>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </div>
  )
}
