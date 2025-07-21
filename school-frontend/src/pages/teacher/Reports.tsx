/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { PDFDownloadLink } from '@react-pdf/renderer'
import StudentReportPDF from '../../components/pdf/StudentReportPDF'

const API = 'http://localhost:5001/api/v1'

interface Assignment {
  id: number
  class_id: number
  class_name: string
  subject_id: number
  subject_name: string
}

interface Student {
  student_id: number
  first_name: string
  last_name: string
}

export default function StudentReportCardView() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [students, setStudents] = useState<Student[]>([])

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

  const [report, setReport] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const term = 'Term 2'
  const year = '2025'
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // Fetch assignments on mount
  useEffect(() => {
    axios.get(`${API}/assignments/me`, { headers })
      .then(res => setAssignments(res.data))
      .catch(() => alert('❌ Failed to fetch class assignments'))
  }, [])

  // Fetch students when class is selected
  useEffect(() => {
    if (!selectedClassId) return

    axios.get(`${API}/students/class/${selectedClassId}`, { headers })
      .then(res => setStudents(res.data))
      .catch(() => alert('❌ Failed to fetch students'))
  }, [selectedClassId])

  const fetchReport = async () => {
    if (!selectedStudentId) return
    setLoading(true)

    try {
      const res = await axios.get(`${API}/students/${selectedStudentId}/report-card`, {
        headers,
        params: { term, year }
      })
      setReport(res.data)
    } catch {
      alert('❌ Failed to fetch report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">📘 Generate Student Report Card</h1>

      {/* Class Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Class</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedClassId ?? ''}
          onChange={e => {
            setSelectedClassId(Number(e.target.value))
            setSelectedStudentId(null)
            setReport(null)
          }}
        >
          <option value="">-- Choose Class --</option>
          {assignments.map(a => (
            <option key={a.class_id} value={a.class_id}>
              {a.class_name}
            </option>
          ))}
        </select>
      </div>

      {/* Student Dropdown */}
      {selectedClassId && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Student</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={selectedStudentId ?? ''}
            onChange={e => {
              setSelectedStudentId(Number(e.target.value))
              setReport(null)
            }}
          >
            <option value="">-- Choose Student --</option>
            {students.map(s => (
              <option key={s.student_id} value={s.student_id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Fetch Report Button */}
      {selectedStudentId && (
        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          📄 Load Report
        </button>
      )}

      {/* Report Section */}
      {loading && <p className="mt-4 text-gray-500">Loading report...</p>}
      {!loading && report && (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            {report.student_name}'s Report
          </h2>

          <div className="grid md:grid-cols-2 text-sm gap-4">
            <div>
              <p><strong>Class:</strong> {report.class_name}</p>
              <p><strong>Term:</strong> {report.term}</p>
              <p><strong>Year:</strong> {report.year}</p>
            </div>
            <div>
              <p><strong>Mean Score:</strong> {report.mean_score}</p>
              <p><strong>Grade:</strong> {report.kcse_grade}</p>
              <p><strong>Position:</strong> #{report.position}</p>
              <p><strong>Class Avg:</strong> {report.class_average}</p>
            </div>
          </div>

          <div className="mt-4">
            <PDFDownloadLink
              document={<StudentReportPDF report={report} />}
              fileName={`${report.student_name}_Report.pdf`}
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              ⬇️ Download PDF Report
            </PDFDownloadLink>
          </div>
        </div>
      )}
    </div>
  )
}
