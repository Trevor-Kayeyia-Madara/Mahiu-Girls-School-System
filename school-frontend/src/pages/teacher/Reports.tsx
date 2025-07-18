import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
}

interface ExamEntry {
  exam: string
  score: number
  term: string
  year: number
}

interface ReportEntry {
  student_name: string
  average_score: number
  kcse_grade: string
  exams: ExamEntry[]
}

const API = 'http://localhost:5001/api/v1'

export default function TeacherGradeReport() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('2025')
  const [reportData, setReportData] = useState<ReportEntry[]>([])

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/teacher-subjects/me`, { headers })
      .then(res => setSubjects(res.data))
      .catch(err => {
        console.error('Failed to load subjects', err)
        setSubjects([])
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFetchReport = async () => {
    const selected = subjects.find(s => s.subject_id === selectedSubjectId)
    if (!selected) return

    try {
      const { data } = await axios.get(
        `${API}/teacher-reports/grades/${selected.class_id}/${selected.subject_id}`,
        {
          headers,
          params: { term: selectedTerm, year: selectedYear }
        }
      )
      setReportData(data)
    } catch (err) {
      console.error('Error fetching report', err)
      setReportData([])
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📊 Teacher Report: Grades Overview</h1>

      <div className="space-y-3 max-w-xl mb-6">
        <div>
          <label className="block font-medium">Select Subject</label>
          <select
            value={selectedSubjectId ?? ''}
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Choose --</option>
            {subjects.map((s) => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.class_name} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Term</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              placeholder="e.g. Term 2"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium">Year</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleFetchReport}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          📥 Load Report
        </button>
      </div>

      {reportData.length > 0 && (
        <div className="bg-white shadow rounded p-4">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Student</th>
                <th className="p-2 text-left">Average</th>
                <th className="p-2 text-left">Grade</th>
                <th className="p-2 text-left">Exams</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((entry, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{entry.student_name}</td>
                  <td className="p-2">{entry.average_score}</td>
                  <td className="p-2">{entry.kcse_grade}</td>
                  <td className="p-2 text-sm">
                    {entry.exams.map((e, i) => (
                      <div key={i}>
                        <strong>{e.exam}</strong>: {e.score} ({e.term}, {e.year})
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
