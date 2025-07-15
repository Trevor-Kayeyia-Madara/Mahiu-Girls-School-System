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
  if (user?.role !== 'teacher') return;

  const fetchTimetable = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5001/api/v1/timetable/me`, // ✅ new secured endpoint
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEntries(res.data);
    } catch (err) {
      console.error('Failed to fetch timetable', err);
    } finally {
      setLoading(false);
    }
  };

  fetchTimetable();
}, [user?.role]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🗓 My Timetable</h1>
      {loading ? (
        <p>Loading...</p>
      ) : entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <table className="w-full border table-auto shadow bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">Day</th>
              <th className="text-left p-2">Start</th>
              <th className="text-left p-2">End</th>
              <th className="text-left p-2">Subject</th>
              <th className="text-left p-2">Class</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-2">{e.day}</td>
                <td className="p-2">{e.start_time}</td>
                <td className="p-2">{e.end_time}</td>
                <td className="p-2">{e.subject}</td>
                <td className="p-2">{e.class}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
