/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { saveAs } from 'file-saver'

interface ClassRoom {
  class_id: number
  class_name: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

interface ReportRow {
  student_id: number
  student_name: string
  average_score: number
  mean_grade: string
  position: number
}

export default function AdminReports() {
  const [classes, setClasses] = useState<ClassRoom[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)
  const [classReport, setClassReport] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await axios.get<ClassRoom[]>('http://localhost:5001/api/v1/classrooms', { headers })
        if (Array.isArray(res.data)) {
          setClasses(res.data)
        } else {
          console.error('Expected array, got:', res.data)
        }
      } catch (err) {
        console.error('Failed to load classes', err)
      }
    }

    fetchInitial()
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId) return
      try {
        const res = await axios.get<Student[]>(`http://localhost:5001/api/v1/students/class/${selectedClassId}`, { headers })
        if (Array.isArray(res.data)) {
          setStudents(res.data)
        } else {
          console.error('Expected student array, got:', res.data)
        }
      } catch (err) {
        console.error('Failed to load students', err)
      }
    }

    fetchStudents()
  }, [selectedClassId])

  const loadClassReport = async () => {
    if (!selectedClassId) return
    try {
      setLoading(true)
      const res = await axios.get<{ students: ReportRow[] }>(`http://localhost:5001/api/v1/reports/class/${selectedClassId}`, { headers })
      setClassReport(Array.isArray(res.data.students) ? res.data.students : [])
    } catch (err) {
      console.error('Failed to load report', err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/class/${selectedClassId}/csv`, {
        headers,
        responseType: 'blob',
      })
      saveAs(res.data, `class_${selectedClassId}_report.csv`)
    } catch (err) {
      console.error('CSV export failed', err)
    }
  }

  const exportPDF = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/reports/export/class/${selectedClassId}/pdf`, {
        headers,
        responseType: 'blob',
      })
      saveAs(res.data, `class_${selectedClassId}_report.pdf`)
    } catch (err) {
      console.error('PDF export failed', err)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Reports Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block font-medium">Select Class</label>
          <select
            value={selectedClassId || ''}
            onChange={(e) => {
              const id = Number(e.target.value)
              setSelectedClassId(id || null)
              setSelectedStudentId(null)
              setClassReport([])
            }}
            className="border p-2 rounded"
          >
            <option value="">-- Select Class --</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.class_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Student</label>
          <select
            value={selectedStudentId || ''}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="border p-2 rounded"
            disabled={!selectedClassId}
          >
            <option value="">-- View All --</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={loadClassReport}
            disabled={!selectedClassId}
          >
            🔍 View Class Report
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading report...</p>
      ) : (
        classReport.length > 0 && (
          <div>
            <div className="mb-2 flex justify-end gap-2">
              <button onClick={exportCSV} className="bg-green-600 px-3 py-1 text-white rounded text-sm">
                Export CSV
              </button>
              <button onClick={exportPDF} className="bg-red-600 px-3 py-1 text-white rounded text-sm">
                Export PDF
              </button>
            </div>

            <table className="w-full bg-white shadow rounded text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">#</th>
                  <th className="text-left p-2">Student</th>
                  <th className="text-left p-2">Mean Score</th>
                  <th className="text-left p-2">Grade</th>
                  <th className="text-left p-2">Position</th>
                </tr>
              </thead>
              <tbody>
                {classReport.map((s, idx) => (
                  <tr key={s.student_id} className="border-t">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{s.student_name}</td>
                    <td className="p-2">{s.average_score}</td>
                    <td className="p-2">{s.mean_grade}</td>
                    <td className="p-2">{s.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
