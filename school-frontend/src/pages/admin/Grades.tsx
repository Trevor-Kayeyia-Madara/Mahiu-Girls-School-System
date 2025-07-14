/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Grade {
  grade_id: number
  student_name: string
  admission_number: string
  subject: string
  score: number
  exam_name: string
  term: string
  year: number
  teacher_name: string
}

interface ClassOption {
  class_id: number
  class_name: string
}

interface SubjectOption {
  subject_id: number
  name: string
}

interface ExamOption {
  exam_id: number
  name: string
}

export default function AdminGrades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(false)

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [exams, setExams] = useState<ExamOption[]>([])
  const token = localStorage.getItem('token')

  const [filters, setFilters] = useState({
    class_id: '',
    subject_id: '',
    exam_id: '',
    term: '',
    year: new Date().getFullYear().toString()
  })

  const termOptions = ['Term 1', 'Term 2', 'Term 3']
  const yearOptions = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  )

  const fetchFilters = async () => {
    const [classRes, subjectRes, examRes] = await Promise.all([
      axios.get('http://localhost:5001/api/v1/classrooms',{
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://localhost:5001/api/v1/subjects',{
          headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get('http://localhost:5001/api/v1/exams',{
          headers: { Authorization: `Bearer ${token}` },
      })
    ])
    setClasses(classRes.data)
    setSubjects(subjectRes.data)
    setExams(examRes.data)
  }

  const fetchGrades = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = Object.entries(filters)
        .filter(([value]) => value !== '')
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

      const res = await axios.get('http://localhost:5001/api/v1/grades', {
        headers: { Authorization: `Bearer ${token}` },
        params
      })
      setGrades(res.data)
    } catch (err) {
      console.error('Error loading grades:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchGrades()
  }, [filters])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Grades Overview</h1>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <select name="class_id" value={filters.class_id} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.class_id} value={c.class_id}>
              {c.class_name}
            </option>
          ))}
        </select>

        <select name="subject_id" value={filters.subject_id} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.name}
            </option>
          ))}
        </select>

        <select name="exam_id" value={filters.exam_id} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Exams</option>
          {exams.map((e) => (
            <option key={e.exam_id} value={e.exam_id}>
              {e.name}
            </option>
          ))}
        </select>

        <select name="term" value={filters.term} onChange={handleFilterChange} className="border p-2 rounded">
          <option value="">All Terms</option>
          {termOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select name="year" value={filters.year} onChange={handleFilterChange} className="border p-2 rounded">
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Grades Table */}
      {loading ? (
        <p>Loading grades...</p>
      ) : grades.length === 0 ? (
        <p className="text-gray-500">No grades found for selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Adm No.</th>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Exam</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Term</th>
                <th className="p-2 text-left">Year</th>
                <th className="p-2 text-left">Teacher</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.grade_id} className="border-t">
                  <td className="p-2">{g.student_name}</td>
                  <td className="p-2">{g.admission_number}</td>
                  <td className="p-2">{g.subject}</td>
                  <td className="p-2">{g.exam_name}</td>
                  <td className="p-2">{g.score}</td>
                  <td className="p-2">{g.term}</td>
                  <td className="p-2">{g.year}</td>
                  <td className="p-2">{g.teacher_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
