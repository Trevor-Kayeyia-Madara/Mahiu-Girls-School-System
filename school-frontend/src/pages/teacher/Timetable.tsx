import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

interface TimetableEntry {
  id: number
  class: string
  day: string
  start_time: string
  end_time: string
  subject: string
}

export default function TeacherTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.role !== 'teacher') return

    const fetchTimetable = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(
          'http://localhost:5001/api/v1/timetable/me',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setEntries(res.data)
      } catch (err) {
        console.error('Failed to fetch timetable', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimetable()
  }, [user?.role])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">🗓 My Teaching Timetable</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No timetable entries found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-md overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm">📅 Day</th>
                <th className="px-4 py-3 text-left text-sm">⏰ Start</th>
                <th className="px-4 py-3 text-left text-sm">🕒 End</th>
                <th className="px-4 py-3 text-left text-sm">📘 Subject</th>
                <th className="px-4 py-3 text-left text-sm">🏫 Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{e.day}</td>
                  <td className="px-4 py-2">{e.start_time}</td>
                  <td className="px-4 py-2">{e.end_time}</td>
                  <td className="px-4 py-2 font-medium text-blue-700">{e.subject}</td>
                  <td className="px-4 py-2">{e.class}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
