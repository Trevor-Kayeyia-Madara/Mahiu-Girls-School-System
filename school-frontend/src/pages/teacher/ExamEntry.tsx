/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Exam {
  exam_id: number
  name: string
  term: string
  year: number
}

interface Subject {
  name: string
}

interface Classroom {
  class_name: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface ClassAssignment {
  id: number
  subject: Subject
  classroom: Classroom
  students?: Student[]
}

interface ExamSchedule {
  id: number
  exam: Exam
  class_assignment: ClassAssignment
}

const API = 'http://localhost:5001/api/v1'

export default function ExamSchedulesPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [assignments, setAssignments] = useState<ClassAssignment[]>([])
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null)
  const [marks, setMarks] = useState<Record<number, number>>({})
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    await Promise.all([fetchExams(), fetchAssignments(), fetchSchedules()])
  }

  const fetchExams = async () => {
    try {
      const { data } = await axios.get(`${API}/exams/`)
      setExams(data)
    } catch {
      alert('❌ Could not fetch exams.')
    }
  }

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/class-assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAssignments(data)
    } catch {
      alert('❌ Could not fetch class assignments.')
    }
  }

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.get(`${API}/exam-schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSchedules(data)
    } catch {
      alert('❌ Could not fetch exam schedules.')
    }
  }

  const handleCreateSchedule = async () => {
    const token = localStorage.getItem('token')
    if (!token || !selectedExamId || !selectedAssignmentId)
      return alert('❌ Select both an exam and a class assignment.')

    try {
      await axios.post(`${API}/exam-schedules`, {
        exam_id: selectedExamId,
        class_assignment_id: selectedAssignmentId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert('✅ Schedule created')
      fetchSchedules()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert('❌ Schedule already exists.')
      } else {
        alert('❌ Failed to create schedule.')
      }
    }
  }

  const handleMarkChange = (studentId: number, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: parseFloat(value) || 0
    }))
  }

  const submitGrades = async () => {
    if (!selectedSchedule) return alert('❌ No schedule selected.')
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
    } catch {
      alert('❌ Could not submit grades')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-6">📚 Exam Schedules & Marks</h1>

      {/* Create Schedule */}
      <div className="mb-6 p-4 bg-gray-50 border rounded">
        <h2 className="text-lg font-semibold mb-3">➕ Create Exam Schedule</h2>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Select Exam:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedExamId ?? ''}
            onChange={e => setSelectedExamId(parseInt(e.target.value))}
          >
            <option value="">-- Select Exam --</option>
            {exams.map(e => (
              <option key={e.exam_id} value={e.exam_id}>
                {`${e.name} (${e.term} ${e.year})`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block mb-1 font-medium">Select Class Assignment:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedAssignmentId ?? ''}
            onChange={e => setSelectedAssignmentId(parseInt(e.target.value))}
          >
            <option value="">-- Select Class Assignment --</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>
                {`${a.classroom.class_name} - ${a.subject.name}`}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreateSchedule}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          ➕ Create Schedule
        </button>
      </div>

      {/* Select Schedule for Marks */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Schedule to Enter Marks:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedSchedule?.id ?? ''}
          onChange={e => {
            const id = parseInt(e.target.value)
            const found = schedules.find(s => s.id === id)
            setSelectedSchedule(found || null)
          }}
        >
          <option value="">-- Select Schedule --</option>
          {schedules.map(s => (
            <option key={s.id} value={s.id}>
              {`${s.exam.name} - ${s.class_assignment.classroom.class_name} (${s.class_assignment.subject.name})`}
            </option>
          ))}
        </select>
      </div>

      {/* Enter Marks */}
      {selectedSchedule?.class_assignment.students && (
        <>
          <table className="w-full bg-white shadow rounded mb-4">
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
                      onChange={e => handleMarkChange(student.student_id, e.target.value)}
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
