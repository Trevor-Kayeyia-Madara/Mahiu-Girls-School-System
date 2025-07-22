/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'

interface StudentSummary {
  student_id: number
  student_name: string
  class_name: string
  mean_score: number
  kcse_grade: string
}

interface FormSummary {
  student_count: number
  mean_score: number
  grade_distribution: Record<string, number>
  students: StudentSummary[]
}

export default function AdminOverallReports() {
  const [overallData, setOverallData] = useState<Record<string, FormSummary>>({})
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/reports/overall-forms', { headers })
      .then(res => setOverallData(res.data))
      .catch(err => console.error('Failed to load overall data:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📚 Overall Grades Summary by Form</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        Object.entries(overallData).map(([form, summary]) => (
          <div key={form} className="mb-8 bg-gray-50 p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{form}</h2>
            <p><strong>Total Students:</strong> {summary.student_count}</p>
            <p><strong>Form Mean Score:</strong> {summary.mean_score}</p>

            {/* Grade Distribution */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">🎯 KCSE Grade Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(summary.grade_distribution).map(([grade, count]) => (
                  <div key={grade} className="bg-white border rounded p-2">
                    Grade <strong>{grade}</strong>: {count}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Breakdown */}
            <div className="mt-6 overflow-x-auto">
              <h3 className="font-semibold mb-2">📄 Student Breakdown</h3>
              <table className="w-full table-auto bg-white shadow rounded text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Class</th>
                    <th className="text-left p-2">Mean Score</th>
                    <th className="text-left p-2">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.students.map((student, i) => (
                    <tr key={student.student_id} className="border-t">
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2">{student.student_name}</td>
                      <td className="p-2">{student.class_name}</td>
                      <td className="p-2">{student.mean_score}</td>
                      <td className="p-2">{student.kcse_grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
