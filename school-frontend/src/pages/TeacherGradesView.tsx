import { useEffect, useState } from 'react'
import axios from 'axios'
import TeacherLayout from '../layouts/TeacherLayout'

interface StudentGrade {
  student_id: number
  name: string
  admission_number: string
  score: number
  term: string
  year: number
}

interface ClassOption {
  id: number
  name: string
}

interface SubjectOption {
  id: number
  name: string
}

export default function TeacherGradesView() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)
  const [grades, setGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(false)

  const getKCSEGrade = (score: number): string => {
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
    return 'F'
  }

  useEffect(() => {
    axios.get('/api/v1/teacher/assignments').then((res) => {
      const { classes, subjects } = res.data
      setClasses(classes)
      setSubjects(subjects)
    })
  }, [])

  const fetchGrades = async () => {
    if (!selectedClass || !selectedSubject) return
    setLoading(true)
    try {
      const res = await axios.get(
        `/api/v1/grades/class/${selectedClass}/subject/${selectedSubject}`
      )
      setGrades(res.data)
    } catch (err) {
      console.error('Failed to load grades', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TeacherLayout>
      <h1 className="text-2xl font-bold mb-4">📊 View Student Grades</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={selectedClass ?? ''}
          onChange={(e) => setSelectedClass(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSubject ?? ''}
          onChange={(e) => setSelectedSubject(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchGrades}
          disabled={!selectedClass || !selectedSubject}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Load Grades
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : grades.length > 0 ? (
        <table className="w-full bg-white shadow rounded table-auto">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Admission #</th>
              <th className="p-2">Score</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Term</th>
              <th className="p-2">Year</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.student_id} className="border-t">
                <td className="p-2">{g.name}</td>
                <td className="p-2">{g.admission_number}</td>
                <td className="p-2">{g.score}</td>
                <td className="p-2">{getKCSEGrade(g.score)}</td>
                <td className="p-2">{g.term}</td>
                <td className="p-2">{g.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No grades found.</p>
      )}
    </TeacherLayout>
  )
}
