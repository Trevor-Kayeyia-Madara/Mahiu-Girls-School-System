/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import TimetableForm from '../../components/TimetableForm'

interface Entry {
  id: number
  subject: string
  day: string
  start_time: string
  end_time: string
  teacher: string | null
}

interface Classroom {
  class_id: number
  class_name: string
}

export default function AdminTimetable() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const token = localStorage.getItem('token')

  const fetchTimetable = async (classId: number) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/timetable/class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEntries(res.data)
    } catch (error) {
      console.error('Failed to fetch timetable:', error)
    }
  }

  const fetchClassrooms = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/classrooms', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setClassrooms(res.data)
    } catch (error) {
      console.error('Failed to fetch classrooms:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry?')) return
    try {
      await axios.delete(`http://localhost:5001/api/v1/timetable/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (selectedClassId) fetchTimetable(selectedClassId)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  useEffect(() => {
    fetchClassrooms()
  }, [])

  useEffect(() => {
    if (selectedClassId) fetchTimetable(selectedClassId)
  }, [selectedClassId])

  const groupedByDay = entries.reduce((acc, entry) => {
    if (!acc[entry.day]) acc[entry.day] = []
    acc[entry.day].push(entry)
    return acc
  }, {} as Record<string, Entry[]>)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🗓️ Class Timetable</h1>

      <select
        className="border p-2 mb-4 rounded"
        value={selectedClassId ?? ''}
        onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
      >
        <option value="">-- Select Class --</option>
        {classrooms.map((cls) => (
          <option key={cls.class_id} value={cls.class_id}>
            {cls.class_name}
          </option>
        ))}
      </select>

      {selectedClassId && (
        <>
          <button
            onClick={() => {
              setEditingEntry(null)
              setShowForm(true)
            }}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            ➕ Add Entry
          </button>

          {Object.keys(groupedByDay).map((day) => (
            <div key={day} className="mb-6">
              <h2 className="text-lg font-semibold">{day}</h2>
              <table className="w-full table-auto bg-white rounded shadow mt-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Subject</th>
                    <th className="text-left p-2">Start</th>
                    <th className="text-left p-2">End</th>
                    <th className="text-left p-2">Teacher</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedByDay[day].map((entry) => (
                    <tr key={entry.id}>
                      <td className="p-2">{entry.subject}</td>
                      <td className="p-2">{entry.start_time}</td>
                      <td className="p-2">{entry.end_time}</td>
                      <td className="p-2">{entry.teacher || '—'}</td>
                      <td className="p-2 space-x-2">
                        <button
                          className="text-blue-600"
                          onClick={() => {
                            setEditingEntry(entry)
                            setShowForm(true)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600"
                          onClick={() => handleDelete(entry.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      {showForm && selectedClassId && (
        <TimetableForm
          classId={selectedClassId}
          editing={editingEntry}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            fetchTimetable(selectedClassId)
            setShowForm(false)
          }}
        />
      )}
    </div>
  )
}
