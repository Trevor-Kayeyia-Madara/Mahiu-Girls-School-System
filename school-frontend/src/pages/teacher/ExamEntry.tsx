import { useState, useEffect } from 'react'
import axios from 'axios'

interface Exam {
  exam_id: number
  name: string
  term: string
  year: number
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface Subject {
  name: string
}

interface Classroom {
  class_name: string
}

interface ClassAssignment {
  subject: Subject
  classroom: Classroom
  students: Student[]
}

interface ExamSchedule {
  id: number
  exam: Exam
  class_assignment: ClassAssignment
}

const API = 'http://localhost:5001/api/v1'

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null)
  const [marks, setMarks] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchExams = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API}/exams/`)
      setExams(data)
    } catch (err) {
      console.error('Error fetching exams', err)
      alert('❌ Could not fetch exams.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/exam-schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSchedules(data)
    } catch (err) {
      console.error('Error loading schedules', err)
      alert('❌ Failed to load exam schedules')
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleCreate = async () => {
    const token = localStorage.getItem('token')
    if (!token) return alert('❌ Not logged in')

    const name = prompt('Exam name (e.g. Midterm)')?.trim()
    const term = prompt('Term (e.g. Term 2)')?.trim()
    const year = prompt('Year (e.g. 2025)')?.trim()

    if (!name || !term || !year) {
      alert('❌ All fields are required.')
      return
    }

    try {
      await axios.post(`${API}/exams/`, {
        name,
        term,
        year: parseInt(year),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('✅ Exam created')
      fetchExams()
    } catch (err) {
      console.error('Create exam failed', err)
      alert('❌ Failed to create exam.')
    }
  }

  const handleDelete = async (examId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return alert('❌ Not logged in')

    if (!window.confirm('Delete this exam?')) return

    try {
      await axios.delete(`${API}/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchExams()
    } catch (err) {
      console.error('Delete failed', err)
      alert('❌ Could not delete exam.')
    }
  }

  const handleMarkChange = (studentId: number, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: parseFloat(value) || 0
    }))
  }

  const submitGrades = async () => {
    if (!selectedSchedule) return alert('❌ Select a schedule first')
    const token = localStorage.getItem('token')

    const entries = Object.entries(marks).map(([id, score]) => ({
      student_id: parseInt(id),
      marks: score
    }))

    if (!entries.length) return alert('❌ No marks entered.')

    setSubmitting(true)
    try {
      await axios.post(`${API}/grades`, {
        exam_schedule_id: selectedSchedule.id,
        grades: entries
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('✅ Marks submitted')
      setMarks({})
      setSelectedSchedule(null)
    } catch (err) {
      console.error('Submit failed', err)
      alert('❌ Could not submit grades')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6">📝 Exam Management</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={fetchExams}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          📥 Load Exams
        </button>
        <button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          ➕ Create Exam
        </button>
      </div>

      {loading && <p className="text-gray-600">Loading exams...</p>}

      {exams.length > 0 ? (
        <table className="w-full table-auto bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">Term</th>
              <th className="p-3">Year</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e, i) => (
              <tr key={e.exam_id} className="border-t hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.term}</td>
                <td className="p-3">{e.year}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(e.exam_id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !loading && (
        <p className="text-gray-600">No exams found.</p>
      )}

      <hr className="my-8" />
      <h2 className="text-xl font-semibold mb-2">📊 Enter Marks</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Exam Schedule:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedSchedule?.id || ''}
          onChange={(e) => {
            const id = parseInt(e.target.value)
            const found = schedules.find(s => s.id === id)
            setSelectedSchedule(found || null)
          }}
        >
          <option value="">-- Select --</option>
          {schedules.map(s => (
            <option key={s.id} value={s.id}>
              {`${s.exam.name} - ${s.class_assignment.classroom.class_name} (${s.class_assignment.subject.name})`}
            </option>
          ))}
        </select>
      </div>

      {selectedSchedule && (
        <>
          <table className="w-full table-auto bg-white shadow rounded mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Student</th>
                <th className="p-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {selectedSchedule.class_assignment.students.map(student => (
                <tr key={student.student_id}>
                  <td className="p-2">{student.first_name} {student.last_name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-full border px-2 py-1 rounded"
                      value={marks[student.student_id] || ''}
                      onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={submitGrades}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            {submitting ? 'Submitting...' : '✅ Submit Marks'}
          </button>
        </>
      )}
    </div>
  )
}
