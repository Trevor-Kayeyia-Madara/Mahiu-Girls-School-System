import { useEffect, useState } from 'react'
import axios from 'axios'

interface TimetableEntry {
  id?: number
  subject: string
  start_time: string
  end_time: string
  day: string
  teacher?: string | null
}

interface Props {
  classId: number
  editing?: TimetableEntry | null
  onClose: () => void
  onSaved: () => void
}

interface Subject {
  subject_id: number
  name: string
}

interface Teacher {
  teacher_id: number
  name: string
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function TimetableForm({ classId, editing, onClose, onSaved }: Props) {
  const [subjectId, setSubjectId] = useState<number | null>(null)
  const [day, setDay] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [teacherId, setTeacherId] = useState<number | null>(null)

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const url = 'http://localhost:5001'
        const [subjectRes, teacherRes] = await Promise.all([
          axios.get(`${url}/api/v1/subjects`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${url}/api/v1/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

        setSubjects(Array.isArray(subjectRes.data) ? subjectRes.data : subjectRes.data?.subjects || [])
        setTeachers(Array.isArray(teacherRes.data) ? teacherRes.data : teacherRes.data?.teachers || [])
      } catch (error) {
        console.error('Error loading metadata:', error)
        alert('Failed to load subjects or teachers.')
      }
    }

    if (token) fetchMeta()
  }, [token])

  useEffect(() => {
    if (editing && subjects.length && teachers.length) {
      const subject = subjects.find((s) => s.name === editing.subject)
      const teacher = teachers.find((t) => t.name === editing.teacher)

      setSubjectId(subject?.subject_id ?? null)
      setDay(editing.day || '')
      setStartTime(editing.start_time || '')
      setEndTime(editing.end_time || '')
      setTeacherId(teacher?.teacher_id ?? null)
    }
  }, [editing, subjects, teachers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subjectId || !day || !startTime || !endTime) {
      alert('Please fill in all required fields.')
      return
    }

    const payload = {
      class_id: classId,
      subject_id: subjectId,
      day,
      start_time: startTime,
      end_time: endTime,
      teacher_id: teacherId || null,
    }

    try {
        const base = 'http://localhost:5001'
      const url = editing?.id
        ? `${base}/api/v1/timetable/${editing.id}`
        : `${base}/api/v1/timetable`

      const method = editing?.id ? axios.put : axios.post

      await method(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      onSaved()
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save timetable entry.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">{editing ? 'Edit Entry' : 'Add Entry'}</h2>

        {/* Subject */}
        <div>
          <label className="block font-medium">Subject</label>
          <select
            value={subjectId ?? ''}
            onChange={(e) => setSubjectId(Number(e.target.value))}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select Subject --</option>
            {(subjects ?? []).map((s) => (
              <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Day */}
        <div>
          <label className="block font-medium">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select Day --</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Times */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block font-medium">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>

        {/* Teacher */}
        <div>
          <label className="block font-medium">Override Teacher (optional)</label>
          <select
            value={teacherId ?? ''}
            onChange={(e) => setTeacherId(Number(e.target.value) || null)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Select Teacher --</option>
            {(teachers ?? []).map((t) => (
              <option key={t.teacher_id} value={t.teacher_id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
