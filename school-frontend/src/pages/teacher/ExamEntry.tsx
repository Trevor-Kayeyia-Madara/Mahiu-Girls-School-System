import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
}

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
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<{ [studentId: number]: number | '' }>({})

  // Fetch subjects
  useEffect(() => {
    axios.get(`${API}/teacher-subjects/me`, { headers })
      .then(res => setSubjects(res.data))
      .catch(err => console.error('Failed to fetch subjects', err))
  }, [])

  const handleSubjectChange = (subjectId: number) => {
    const sub = subjects.find(s => s.subject_id === subjectId)
    setSelectedSubject(sub ?? null)
    setSelectedExamId(null)
    setExams([])
    setStudents([])
    setGrades({})
    if (sub) {
      axios.get(`${API}/exams/class/${sub.class_id}/subject/${sub.subject_id}`, { headers })
        .then(res => setExams(res.data))
        .catch(err => console.error('Failed to fetch exams', err))

      axios.get(`${API}/students/class/${sub.class_id}`, { headers })
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
    if (!selectedSubject || !selectedExamId) return alert('Select both subject and exam.')

    const payload = Object.entries(grades)
      .filter(([, score]) => score !== '')
      .map(([student_id, score]) => ({
        student_id: Number(student_id),
        score,
        class_id: selectedSubject.class_id,
        subject_id: selectedSubject.subject_id,
        exam_id: selectedExamId
      }))

    if (!payload.length) return alert('No grades entered.')

    try {
      await axios.post(`${API}/grades/bulk`, payload, { headers })
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
          value={selectedSubject?.subject_id ?? ''}
          onChange={e => handleSubjectChange(Number(e.target.value))}
        >
          <option value="">-- Choose --</option>
          {subjects.map(s => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.class_name} - {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubject && (
        <div className="mb-4">
          <label className="font-medium">Select Exam</label>
          <select
            className="w-full p-2 border rounded mt-1"
            value={selectedExamId ?? ''}
            onChange={e => setSelectedExamId(Number(e.target.value))}
          >
            <option value="">-- Choose --</option>
            {exams.map(e => (
              <option key={e.exam_id} value={e.exam_id}>
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
