/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface TimetableEntry {
  id?: number
  class_id: number
  day: string
  start_time: string
  end_time: string
  subject: string
  teacher: string
}

interface Subject {
  subject_id: number
  name: string
}

interface Teacher {
  teacher_id: number
  name: string
}

interface Classroom {
  class_id: number
  class_name: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const times = [
  { start: '08:00', end: '08:40' },
  { start: '08:40', end: '09:20' },
  { start: '09:20', end: '10:00' },
  { start: '10:20', end: '11:00' },
  { start: '11:00', end: '11:40' },
  { start: '11:40', end: '12:20' },
  { start: '14:00', end: '14:40' },
  { start: '14:40', end: '15:20' },
]

export default function AdminTimetable() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])

  const token = localStorage.getItem('token')

  const fetchMeta = async () => {
    const [classRes, subRes, teacherRes] = await Promise.all([
      axios.get('http://localhost:5001/api/v1/classrooms',{ headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:5001/api/v1/subjects', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('http://localhost:5001/api/v1/teachers', { headers: { Authorization: `Bearer ${token}` } }),
    ])
    setClassrooms(classRes.data)
    setSubjects(subRes.data)
    setTeachers(teacherRes.data)
  }

  const fetchTimetable = async (classId: number) => {
    const res = await axios.get(`http://localhost:5001/api/v1/timetable/class/${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    setEntries(res.data)
  }

  const saveEntry = async (day: string, timeSlot: { start: string, end: string }, subjectId: number, teacherId: number) => {
    if (!selectedClass) return

    try {
      await axios.post('http://localhost:5001/api/v1/timetable', {
        class_id: selectedClass,
        day,
        start_time: timeSlot.start,
        end_time: timeSlot.end,
        subject_id: subjectId,
        teacher_id: teacherId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchTimetable(selectedClass)
    } catch (err) {
      console.error('Error saving:', err)
    }
  }

  const renderCell = (day: string, time: { start: string, end: string }) => {
    const existing = entries.find(
      e => e.day === day && e.start_time === time.start && e.end_time === time.end
    )

    return (
      <td className="border p-1 text-sm">
        {existing ? (
          <div>
            <div className="font-medium">{existing.subject}</div>
            <div className="text-xs text-gray-500">{existing.teacher}</div>
          </div>
        ) : (
          <InlineEditor
            subjects={subjects}
            teachers={teachers}
            onSave={(sId, tId) => saveEntry(day, time, sId, tId)}
          />
        )}
      </td>
    )
  }

  useEffect(() => {
    fetchMeta()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable(selectedClass)
    }
  }, [selectedClass])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📅 Timetable</h1>

      <select
        value={selectedClass ?? ''}
        onChange={(e) => setSelectedClass(Number(e.target.value))}
        className="mb-4 p-2 border rounded"
      >
        <option value="">-- Select Class --</option>
        {classrooms.map((c) => (
          <option key={c.class_id} value={c.class_id}>
            {c.class_name}
          </option>
        ))}
      </select>

      {selectedClass && (
        <div className="overflow-auto">
          <table className="w-full text-sm border-collapse bg-white shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Day / Time</th>
                {times.map((t, idx) => (
                  <th key={idx} className="p-2 border text-xs">
                    {t.start} - {t.end}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="border p-2 font-semibold bg-gray-50">{day}</td>
                  {times.map((t) => renderCell(day, t))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// === Cleaned InlineEditor Component ===
function InlineEditor({
  subjects,
  teachers,
  onSave,
}: {
  subjects: Subject[]
  teachers: Teacher[]
  onSave: (subjectId: number, teacherId: number) => void
}) {
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [teacherId, setTeacherId] = useState<number | null>(null)

  return (
    <div className="space-y-1">
      <select
        className="w-full border rounded text-xs"
        value={subjectId ?? ''}
        onChange={(e) => setSubjectId(Number(e.target.value))}
      >
        <option value="">-- Subject --</option>
        {subjects.map((s) => (
          <option key={s.subject_id} value={s.subject_id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className="w-full border rounded text-xs"
        value={teacherId ?? ''}
        onChange={(e) => setTeacherId(Number(e.target.value))}
      >
        <option value="">-- Teacher --</option>
        {teachers.map((t) => (
          <option key={t.teacher_id} value={t.teacher_id}>
            {t.name}
          </option>
        ))}
      </select>

      <button
        className="bg-blue-500 text-white px-2 py-1 text-xs rounded w-full"
        onClick={() => {
          if (subjectId && teacherId) onSave(subjectId, teacherId)
        }}
      >
        Save
      </button>
    </div>
  )
}
