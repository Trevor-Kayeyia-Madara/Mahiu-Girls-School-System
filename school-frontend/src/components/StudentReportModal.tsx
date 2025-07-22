import { useEffect, useState } from 'react'
import axios from 'axios'

interface GradeItem {
  subject: string
  marks: number
  grade: string
  term: string
  year: string
  exam_schedule?: {
    exam?: {
      name: string
    }
  }
}

interface ReportData {
  student_id: number
  student_name: string
  class_name: string
  average_score: number
  grades: GradeItem[]
}

interface Props {
  studentId: number
  onClose: () => void
}

export default function StudentReportModal({ studentId, onClose }: Props) {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`http://localhost:5001/api/v1/reports/student/${studentId}`, { headers })
      .then(res => {
        setData(res.data)
      })
      .catch(err => {
        console.error('Failed to load student report', err)
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">📘 Student Report</h2>
          <button onClick={onClose} className="text-red-500 font-bold text-lg">✕</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : data ? (
          <>
            <div className="mb-4 space-y-1">
              <p><strong>Name:</strong> {data.student_name}</p>
              <p><strong>Class:</strong> {data.class_name}</p>
              <p><strong>Mean Score:</strong> {data.average_score}</p>
            </div>

            <table className="w-full table-auto bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">Exam</th>
                  <th className="text-left p-2">Marks</th>
                  <th className="text-left p-2">Grade</th>
                  <th className="text-left p-2">Term</th>
                  <th className="text-left p-2">Year</th>
                </tr>
              </thead>
              <tbody>
                {data.grades.map((g, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{g.subject}</td>
                    <td className="p-2">{g.exam_schedule?.exam?.name || 'N/A'}</td>
                    <td className="p-2">{g.marks}</td>
                    <td className="p-2">{g.grade}</td>
                    <td className="p-2">{g.term}</td>
                    <td className="p-2">{g.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p className="text-red-500">No report data available.</p>
        )}
      </div>
    </div>
  )
}
