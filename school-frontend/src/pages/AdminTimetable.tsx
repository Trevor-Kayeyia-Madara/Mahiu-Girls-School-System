/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

interface Classroom {
  class_id: number
  class_name: string
}

interface Subject {
  subject_id: number
  name: string
}

interface TimetableEntry {
  id: number
  day: string
  start_time: string
  end_time: string
  subject: string
  teacher: string
  subject_id: number
  teacher_id: number
}

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function AdminTimetable() {
  const [classes, setClasses] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [formData, setFormData] = useState({
    day: 'Monday',
    start_time: '08:00',
    end_time: '09:00',
    subject_id: '',
  })

  useEffect(() => {
    const fetchMeta = async () => {
      const [clsRes, subjRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/classrooms'),
        axios.get('http://localhost:5001/api/v1/subjects')
      ])
      setClasses(clsRes.data)
      setSubjects(subjRes.data)
    }
    fetchMeta()
  }, [])

  const fetchTimetable = async (class_id: number) => {
    const res = await axios.get(`http://localhost:5001/api/v1/timetable/${class_id}`)
    setTimetable(res.data)
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const class_id = parseInt(e.target.value)
    setSelectedClass(class_id)
    fetchTimetable(class_id)
  }

const handleAdd = async () => {
  if (selectedClass === null) return  // ✅ Guard clause

  try {
    await axios.post('http://localhost:5001/api/v1/timetable', {
      class_id: selectedClass,
      ...formData
    })
    fetchTimetable(selectedClass)
  } catch (err: any) {
    alert(err.response?.data?.error || 'Failed to add slot')
  }
}

  const handleDelete = async (id: number) => {
    await axios.delete(`http://localhost:5001/api/v1/timetable/${id}`)
    if (selectedClass) fetchTimetable(selectedClass)
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">🕒 Timetabling</h1>

      <div className="mb-6">
        <label className="mr-2 font-medium">Select Class:</label>
        <select
          value={selectedClass || ''}
          onChange={handleClassChange}
          className="border p-2 rounded"
        >
          <option value="">-- Select --</option>
          {classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <>
          <div className="mb-4 bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold mb-2">➕ Add Slot</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="border p-2 rounded"
              >
                {weekdays.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="border p-2 rounded"
              />
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((s) => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAdd}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add to Timetable
            </button>
            <button
                onClick={async () => {
                  const res = await axios.get(
                    `http://localhost:5001/api/v1/timetable/export/${selectedClass}`,
                    { responseType: 'blob' }
                  )
                  const url = window.URL.createObjectURL(new Blob([res.data]))
                  const link = document.createElement('a')
                  link.href = url
                  link.setAttribute('download', 'class_timetable.pdf')
                  document.body.appendChild(link)
                  link.click()
                }}
                className="mb-4 ml-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                🧾 Export to PDF
        </button>
          </div>

          {/* Timetable Grid */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white shadow rounded text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Day</th>
                  <th className="p-2">Time</th>
                  <th className="p-2">Subject</th>
                  <th className="p-2">Teacher</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((slot) => (
                  <tr key={slot.id} className="border-t">
                    <td className="p-2">{slot.day}</td>
                    <td className="p-2">
                      {slot.start_time} - {slot.end_time}
                    </td>
                    <td className="p-2">{slot.subject}</td>
                    <td className="p-2">{slot.teacher || 'N/A'}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {timetable.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No timetable entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
