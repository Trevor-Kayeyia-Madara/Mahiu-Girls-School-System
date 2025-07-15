/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface GradeInput {
  [student_id: number]: number | ''
}

export default function TeacherGrades() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<GradeInput>({})
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/teacher-subjects/me', { headers })

      if (Array.isArray(res.data)) {
        setSubjects(res.data)
      } else {
        console.error('Expected an array of subjects, got:', res.data)
        setSubjects([])
      }
    } catch (err) {
      console.error('Failed to load subjects', err)
      setSubjects([])
    }
  }

  const fetchStudents = async (class_id: number) => {
    try {
      setLoading(true)
      const res = await axios.get(`http://localhost:5001/api/v1/students/class/${class_id}`, { headers })
      setStudents(res.data)

      const initialGrades: GradeInput = {}
      res.data.forEach((s: Student) => {
        initialGrades[s.student_id] = ''
      })
      setGrades(initialGrades)
    } catch (err) {
      console.error('Failed to load students', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (id: number) => {
    setSelected(id)
    const subject = subjects.find(s => s.subject_id === id)
    if (subject) fetchStudents(subject.class_id)
  }

  const handleInput = (student_id: number, score: string) => {
    const value = parseFloat(score)
    setGrades((prev) => ({
      ...prev,
      [student_id]: isNaN(value) ? '' : value
    }))
  }

  const handleSubmit = async () => {
    const subject = subjects.find(s => s.subject_id === selected)
    if (!subject) return

    const payload = Object.entries(grades)
      .filter(([val]) => val !== '')
      .map(([student_id, score]) => ({
        student_id: Number(student_id),
        score,
        class_id: subject.class_id,
        subject_id: subject.subject_id,
        exam_id: 1 // can be dynamic
      }))

    try {
      await axios.post('http://localhost:5001/api/v1/grades/bulk', payload, { headers })
      alert('✅ Grades saved successfully!')
    } catch (err) {
      console.error('❌ Failed to save grades', err)
      alert('Failed to save grades.')
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📝 Grade Entry</h1>

      {/* Subject Selector */}
      <div className="mb-4">
        <label className="font-medium block mb-1">Select Subject</label>
        <select
          value={selected ?? ''}
          onChange={(e) => handleSelect(Number(e.target.value))}
          className="border p-2 rounded w-full max-w-md"
        >
          <option value="">-- Choose --</option>
          {Array.isArray(subjects) && subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.class_name} - {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : students.length > 0 ? (
        <>
          <table className="w-full border rounded mt-4 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, index) => (
                <tr key={s.student_id} className="border-t">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">{s.first_name} {s.last_name}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={grades[s.student_id]}
                      onChange={(e) => handleInput(s.student_id, e.target.value)}
                      className="w-24 border rounded p-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            💾 Submit Grades
          </button>
        </>
      ) : (
        selected && <p className="text-gray-500">No students found for this class.</p>
      )}
    </div>
  )
}
