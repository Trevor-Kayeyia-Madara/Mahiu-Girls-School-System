/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface SubjectGrade {
  subject: string
  marks: number
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

  // Fetch children (students)
  useEffect(() => {
    axios.get('http://localhost:5001/api/v1/parents/me/students', { headers })
      .then(res => setChildren(res.data))
      .catch(err => console.error('❌ Failed to fetch children:', err))
  }, [])

  // Fetch report data
  const loadReport = () => {
    if (!selectedStudentId) return
    axios.get(`http://localhost:5001/api/v1/reports/student/${selectedStudentId}`, { headers })
      .then(res => setReport(res.data))
      .catch(err => {
        console.error('❌ Failed to load report:', err)
        setReport(null)
      })
  }

  // Export PDF or CSV
  const exportReport = async (type: 'pdf' | 'csv') => {
    if (!selectedStudentId) return

    try {
      const res = await axios.get(
        `http://localhost:5001/api/v1/reports/export/student/${selectedStudentId}/${type}`,
        {
          headers,
          responseType: 'blob', // ✅ critical fix
        }
      )

      const child = children.find(c => c.student_id === selectedStudentId)
      const fileName = `${child?.first_name}_${child?.last_name}_report.${type}`
      saveAs(res.data, fileName)
    } catch (err) {
      console.error(`❌ Failed to export ${type.toUpperCase()}:`, err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📄 Student Report Card</h1>

      {/* Child Selector */}
      <div className="mb-4 max-w-sm">
        <label className="block font-medium mb-1">Select Child</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choose Child --</option>
          {children.map(c => (
            <option key={c.student_id} value={c.student_id}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>
        <button
          onClick={loadReport}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          📥 Load Report
        </button>
      </div>

      {/* Report Viewer */}
      {report && (
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">{report.student_name}</h2>
          <p className="text-gray-600 mb-4">Class: {report.class_name}</p>

          <table className="w-full bg-white table-auto mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Subject</th>
                <th className="text-left p-2">Marks</th>
                <th className="text-left p-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {report.grades.map((g, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{g.subject}</td>
                  <td className="p-2">{g.marks}</td>
                  <td className="p-2">{g.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right font-semibold mb-2">
            Total Average: {report.average_score}
          </div>

          <div className="space-x-2">
            <button onClick={() => exportReport('pdf')} className="bg-red-600 text-white px-3 py-1 rounded">
              🧾 Download PDF
            </button>
            <button onClick={() => exportReport('csv')} className="bg-green-600 text-white px-3 py-1 rounded">
              📄 Download CSV
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
