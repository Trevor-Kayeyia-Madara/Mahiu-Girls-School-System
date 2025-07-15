import { useEffect, useState } from 'react'
import axios from 'axios'

interface StudentReportModalProps {
  studentId: number
  onClose: () => void
}

interface ReportItem {
  subject: string
  grade: string
  comment?: string
}

export default function StudentReportModal({ studentId, onClose }: StudentReportModalProps) {
  const [report, setReport] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    const fetchReport = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          `http://localhost:5001/api/v1/reports/student/${studentId}`,
          { headers }
        )
        if (Array.isArray(res.data)) {
          setReport(res.data)
        } else {
          setReport([])
        }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl relative">
        <button
          className="absolute top-2 right-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-xl font-semibold mb-4">📄 Student Report</h2>

        {loading ? (
          <p className="text-gray-600">Loading report...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : report.length === 0 ? (
          <p className="text-gray-600">No report available for this student.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2 border">Subject</th>
                <th className="px-4 py-2 border">Grade</th>
                <th className="px-4 py-2 border">Comment</th>
              </tr>
            </thead>
            <tbody>
              {report.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 border">{item.subject}</td>
                  <td className="px-4 py-2 border">{item.grade}</td>
                  <td className="px-4 py-2 border">{item.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
