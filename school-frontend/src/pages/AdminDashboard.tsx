/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from '../context/authContext'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const { user } = useAuth()

  const [students, setStudents] = useState(0)
  const [teachers, setTeachers] = useState(0)
  const [classes, setClasses] = useState(0)
  const [announcements, setAnnouncements] = useState<string[]>([])

  useEffect(() => {
    axios.get('/api/v1/students').then(res => setStudents(res.data.length))
    axios.get('/api/v1/staff').then(res => setTeachers(res.data.length))
    axios.get('/api/v1/classrooms').then(res => setClasses(res.data.length))
    axios.get('/api/v1/announcements').then(res =>
      setAnnouncements(res.data.map((a: any) => a.title))
    )
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Welcome {user?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="👥 Students" value={students} />
        <StatCard label="👩‍🏫 Teachers" value={teachers} />
        <StatCard label="🏫 Classes" value={classes} />
      </div>

      <div className="bg-white p-4 shadow rounded mt-6">
        <h2 className="text-xl font-semibold mb-2">📢 Recent Announcements</h2>
        <ul className="space-y-2">
          {announcements.length === 0 && <li className="text-gray-500">No announcements found.</li>}
          {announcements.map((msg, idx) => (
            <li key={idx} className="border-b pb-2">
              {msg}
            </li>
          ))}
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}