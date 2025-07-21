// src/components/StudentReportCardView.tsx
import { useEffect, useState } from 'react'
import axios from 'axios'

interface SubjectReport {
  subject_name: string
  average_score: number
  kcse_grade: string
  exams: { exam: string; score: number; term: string; year: number }[]
}

interface LeaderboardEntry {
  student_id: number
  student_name: string
  mean: number
  kcse_grade: string
}

interface StudentReport {
  student_id: number
  student_name: string
  class_name: string
  term: string
  year: string
  mean_score: number
  kcse_grade: string
  position: number
  class_average: number
  leaderboard: LeaderboardEntry[]
  subjects: SubjectReport[]
}

interface Props {
  studentId: number
}

export default function StudentReportCardView({ studentId }: Props) {
  const [report, setReport] = useState<StudentReport | null>(null)
  const [loading, setLoading] = useState(true)

  const term = 'Term 2'
  const year = '2025'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!studentId) return

    axios
      .get(`http://localhost:5001/api/v1/students/${studentId}/report-card`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { term, year }
      })
      .then(res => setReport(res.data))
      .catch(err => console.error('Failed to fetch report card', err))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) return <p className="text-gray-500">Loading...</p>
  if (!report) return <p className="text-red-500">No report found.</p>

  return (
    <div className="bg-white p-6 shadow rounded">
      <h2 className="text-xl font-bold text-blue-800 mb-4">📘 Report Card</h2>

      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
        <div>
          <p><strong>Student:</strong> {report.student_name}</p>
          <p><strong>Class:</strong> {report.class_name}</p>
        </div>
        <div>
          <p><strong>Term:</strong> {report.term}</p>
          <p><strong>Year:</strong> {report.year}</p>
        </div>
      </div>

      <div className="mb-6 border-t pt-4 text-sm">
        <p><strong>Mean Score:</strong> {report.mean_score}</p>
        <p><strong>KCSE Grade:</strong> {report.kcse_grade}</p>
        <p><strong>Position:</strong> #{report.position}</p>
        <p><strong>Class Average:</strong> {report.class_average}</p>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">📚 Subject Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-blue-100 text-blue-900">
            <tr>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Average</th>
              <th className="p-2 border">KCSE Grade</th>
              <th className="p-2 border">Exams</th>
            </tr>
          </thead>
          <tbody>
            {report.subjects.map((subject, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-2 border">{subject.subject_name}</td>
                <td className="p-2 border">{subject.average_score}</td>
                <td className="p-2 border">{subject.kcse_grade}</td>
                <td className="p-2 border">
                  {subject.exams.map((exam, idx) => (
                    <div key={idx}>{exam.exam}: {exam.score}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold mt-6 text-gray-800">🏅 Top Students</h3>
      <ul className="text-sm mt-2">
        {report.leaderboard.map((entry, index) => (
          <li key={entry.student_id}>
            #{index + 1} {entry.student_name} - {entry.mean} ({entry.kcse_grade})
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <a
          href={`http://localhost:5001/api/v1/reports/export/student/${studentId}/pdf?term=${term}&year=${year}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ⬇️ Download PDF
        </a>
      </div>
    </div>
  )
}
