/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/ParentReports.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Student {
  id: number
  name: string
}

interface SubjectGrade {
  subject: string
  score: number
  grade: string
}

interface Report {
  student_name: string
  class_name: string
  average_score: number
  grades: SubjectGrade[]
}

export default function ParentReports() {
  const [children, setChildren] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('')
  const [report, setReport] = useState<Report | null>(null)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/parents/me', { headers })
      .then(res => setChildren(res.data.students))
      .catch(err => console.error('Failed to fetch children', err))
  }, [])

  const loadReport = () => {
    if (!selectedStudentId) return
    axios.get(`http://localhost:5001/api/v1/reports/student/${selectedStudentId}`, { headers })
      .then(res => setReport(res.data))
      .catch(err => {
        console.error('Failed to load report', err)
        setReport(null)
      })
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📄 Student Report Card</h1>

      {/* Child Selector */}
      <div className="mb-4 max-w-sm">
        <label className="block font-medium mb-1">Select Student</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choose Student --</option>
          {children.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          onClick={loadReport}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          📥 Load Report
        </button>
      </div>

      {/* Report Section */}
      {report && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">{report.student_name}</h2>
          <p className="text-gray-600 mb-4">Class: {report.class_name}</p>

          <table className="w-full bg-white table-auto mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Subject</th>
                <th className="text-left p-2">Score</th>
                <th className="text-left p-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {report.grades.map((g, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{g.subject}</td>
                  <td className="p-2">{g.score}</td>
                  <td className="p-2">{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right font-semibold">
            Total Average: {report.average_score} ({report.grades.length > 0 ? report.grades[0].grade : 'N/A'})
          </div>
        </div>
      )}
    </div>
  )
}
