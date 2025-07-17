import { useEffect, useState } from 'react'
import axios from 'axios'

interface Assignment {
  class_id: number
  class_name: string
  subject_id: number
  subject_name: string
}

interface ExamSchedule {
  exam_schedule_id: number
  name: string
  term: string
  year: number
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

const API = 'http://localhost:5001/api/v1'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

function getKCSEGrade(score: number) {
  if (score >= 80) return 'A'
  if (score >= 75) return 'A-'
  if (score >= 70) return 'B+'
  if (score >= 65) return 'B'
  if (score >= 60) return 'B-'
  if (score >= 55) return 'C+'
  if (score >= 50) return 'C'
  if (score >= 45) return 'C-'
  if (score >= 40) return 'D+'
  if (score >= 35) return 'D'
  if (score >= 30) return 'D-'
  return 'E'
}

export default function TeacherExamEntry() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([])
  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<{ [studentId: number]: number | '' }>({})

  // Fetch teacher's assignments
  useEffect(() => {
    axios.get(`${API}/assignments/me`, { headers })
      .then(res => setAssignments(res.data))
      .catch(err => console.error('Failed to fetch assignments', err))
  }, [])

  const handleAssignmentChange = (subjectId: number) => {
    const assignment = assignments.find(a => a.subject_id === subjectId)
    setSelectedAssignment(assignment ?? null)
    setSelectedExamScheduleId(null)
    setExamSchedules([])
    setStudents([])
    setGrades({})

    if (assignment) {
      axios.get(`${API}/exams/class/${assignment.class_id}/subject/${assignment.subject_id}`, { headers })
        .then(res => setExamSchedules(res.data))
        .catch(err => console.error('Failed to fetch exam schedules', err))

      axios.get(`${API}/students/class/${assignment.class_id}`, { headers })
        .then(res => {
          const initialGrades: { [id: number]: number | '' } = {}
          res.data.forEach((s: Student) => { initialGrades[s.student_id] = '' })
          setStudents(res.data)
          setGrades(initialGrades)
        })
        .catch(err => console.error('Failed to fetch students', err))
    }
  }

  const handleGradeChange = (studentId: number, score: string) => {
    const value = parseFloat(score)
    setGrades(prev => ({
      ...prev,
      [studentId]: isNaN(value) ? '' : Math.min(Math.max(value, 0), 100)
    }))
  }

  const handleSubmit = async () => {
    if (!selectedExamScheduleId) {
      return alert('Please select an exam.')
    }

    const payload = {
      exam_schedule_id: selectedExamScheduleId,
      grades: Object.entries(grades)
        .filter(([, score]) => score !== '')
        .map(([student_id, score]) => ({
          student_id: Number(student_id),
          marks: score
        }))
    }

    if (!payload.grades.length) return alert('No grades entered.')

    try {
      await axios.post(`${API}/grades`, payload, { headers })
      alert('✅ Grades submitted successfully.')
    } catch (err) {
      console.error('Error submitting grades:', err)
      alert('❌ Failed to submit grades.')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Enter Exam Grades</h1>

      <div className="mb-4">
        <label className="font-medium">Select Subject</label>
        <select
          className="w-full p-2 border rounded mt-1"
          value={selectedAssignment?.subject_id ?? ''}
          onChange={e => handleAssignmentChange(Number(e.target.value))}
        >
          <option value="">-- Choose --</option>
          {assignments.map((a, index) => (
            <option key={index} value={a.subject_id}>
              {a.class_name} - {a.subject_name}
            </option>
          ))}
        </select>
      </div>

      {selectedAssignment && (
        <div className="mb-4">
          <label className="font-medium">Select Exam</label>
          <select
            className="w-full p-2 border rounded mt-1"
            value={selectedExamScheduleId ?? ''}
            onChange={e => setSelectedExamScheduleId(Number(e.target.value))}
          >
            <option value="">-- Choose --</option>
            {examSchedules.map(e => (
              <option key={e.exam_schedule_id} value={e.exam_schedule_id}>
                {e.name} ({e.term} {e.year})
              </option>
            ))}
          </select>
        </div>
      )}

      {students.length > 0 && (
        <>
          <table className="w-full bg-white rounded shadow table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const score = grades[s.student_id]
                const gradeLabel = typeof score === 'number' ? getKCSEGrade(score) : ''
                return (
                  <tr key={s.student_id} className="border-t">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{s.first_name} {s.last_name}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        className="border p-1 rounded w-24"
                        value={score}
                        onChange={(e) => handleGradeChange(s.student_id, e.target.value)}
                      />
                    </td>
                    <td className="p-2">{gradeLabel}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            💾 Submit Grades
          </button>
        </>
      )}
    </div>
  )
}
