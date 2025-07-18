import { useEffect, useState } from 'react'
import axios from 'axios'

export interface StudentReportModalProps {
  studentId: number
  onClose: () => void
}

interface ReportItem {
  subject: string
  exam_schedule: {
    exam: {
      name: string
    } | null
  } | null
  marks: number
  term: string
  year: number
  grade: string
}


interface StudentReport {
  student_id: number
  student_name: string
  class_name: string
  average_score: number
  grades: ReportItem[]
}

const StudentReportModal: React.FC<StudentReportModalProps> = ({ studentId, onClose }) => {
  const [report, setReport] = useState<ReportItem[]>([])
  const [studentName, setStudentName] = useState('')
  const [average, setAverage] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      try {
        setLoading(true)
        const res = await axios.get<StudentReport>(
          `http://localhost:5001/api/v1/reports/student/${studentId}`,
          { headers }
        )
        setReport(res.data.grades)
        setStudentName(res.data.student_name)
        setAverage(res.data.average_score)
      } catch (err) {
        console.error('Failed to load student report', err)
        setError('Failed to load student report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [studentId])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-2">📋 Student Report</h2>

        {studentName && average !== null && (
          <div className="mb-4 text-lg font-medium text-gray-700">
            {studentName} | Average Score:{' '}
            <span className="text-blue-600 font-semibold">{average}</span>
          </div>
        )}

        {loading ? (
          <p className="text-gray-600">Loading report...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : report.length === 0 ? (
          <p className="text-gray-500">No report data available for this student.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-4 py-2 border">Subject</th>
                  <th className="px-4 py-2 border">Exam</th>
                  <th className="px-4 py-2 border">Score</th>
                  <th className="px-4 py-2 border">Grade</th>
                  <th className="px-4 py-2 border">Term</th>
                  <th className="px-4 py-2 border">Year</th>
                </tr>
              </thead>
              <tbody>
                {report.map((g, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 border-t">
                    <td className="px-4 py-2 border">{g.subject}</td>
                    <td className="px-4 py-2 border">{g.exam_schedule?.exam?.name || 'N/A'}</td>
                    <td className="px-4 py-2 border">{g.marks}</td>
                    <td className="px-4 py-2 border">{g.grade}</td>
                    <td className="px-4 py-2 border">{g.term}</td>
                    <td className="px-4 py-2 border">{g.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentReportModal
