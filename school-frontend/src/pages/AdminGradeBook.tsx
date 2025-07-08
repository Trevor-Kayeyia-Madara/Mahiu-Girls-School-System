/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminLayout from '../layouts/AdminLayout'

interface GradeEntry {
  student_id: number
  student_name: string
  class_name: string
  subject: string
  score: number
  grade: string
  term: string
  year: number
  average_score?: number
  mean_grade?: string
  position?: number
}

interface Classroom {
  class_id: number
  class_name: string
}

export default function AdminGradebook() {
  const [grades, setGrades] = useState<GradeEntry[]>([])
  const [classes, setClasses] = useState<Classroom[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [classRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/classrooms'),
      ])
      setClasses(classRes.data)
      setLoading(false)
    }

    loadData()
  }, [])

  const fetchGrades = async (class_id: number) => {
    const res = await axios.get(
      `http://localhost:5001/api/v1/reports/class/${class_id}`
    )
    const flat: GradeEntry[] = []
    res.data.students.forEach((student: any) => {
      student.grades.forEach((g: any) => {
        flat.push({
          student_id: student.student_id,
          student_name: student.name,
          class_name: res.data.class_name,
          subject: g.subject,
          score: g.score,
          grade: g.grade,
          term: g.term,
          year: g.year,
          average_score: student.average_score,
          mean_grade: student.mean_grade,
          position: student.position
        })
      })
    })
    setGrades(flat)
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const class_id = parseInt(e.target.value)
    setSelectedClass(class_id)
    fetchGrades(class_id)
  }
  const exportToCSV = () => {
  const csv = [
    ['Student', 'Subject', 'Score', 'Grade', 'Term', 'Year'],
    ...grades.map(g =>
      [g.student_name, g.subject, g.score, g.grade, g.term, g.year]
    ),
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'kcse_gradebook.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
const exportToPDF = async () => {
  if (!selectedClass) return
  const response = await axios.get(
    `http://localhost:5001/api/v1/reports/export/class/${selectedClass}`,
    { responseType: 'blob' }
  )
  const url = URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'kcse_gradebook.pdf')
  
  document.body.appendChild(link)
  link.click()
  link.remove()
}

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">📊 KCSE Gradebook</h1>

      <div className="mb-4">
        <label className="font-medium">Filter by Class:</label>
        <select
          onChange={handleClassChange}
          className="border p-2 ml-2 rounded"
          value={selectedClass || ''}
        >
          <option value="">-- Select Class --</option>
          {classes.map((cls) => (
            <option key={cls.class_id} value={cls.class_id}>
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      {grades.length > 0 && (
        <table className="w-full table-auto bg-white shadow rounded text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Student</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Score</th>
              <th className="p-2">Grade</th>
              <th className="p-2">Term</th>
              <th className="p-2">Year</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{g.student_name}</td>
                <td className="p-2">{g.subject}</td>
                <td className="p-2">{g.score}</td>
                <td className="p-2">{g.grade}</td>
                <td className="p-2">{g.term}</td>
                <td className="p-2">{g.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {grades.length > 0 && (
  <div className="flex gap-4 mt-4">
    <button
      onClick={exportToCSV}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      ⬇️ Export CSV
    </button>
    <button
      onClick={exportToPDF}
      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      🧾 Export PDF
    </button>
  </div>
)}
    </AdminLayout>
  )
}
