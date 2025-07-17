import { useEffect, useState } from 'react'
import axios from 'axios'

interface Subject {
  subject_id: number
  name: string
  class_id: number
  class_name: string
}

interface SummaryRow {
  student_id: number
  student_name: string
  cat1: number
  cat2: number
  main: number
  total: number
  kcse: string
}

const API = 'http://localhost:5001/api/v1'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

export default function OverallGradesSummary() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('')
  const [summary, setSummary] = useState<SummaryRow[]>([])

  useEffect(() => {
    axios.get(`${API}/teacher-subjects/me`, { headers })
      .then(res => setSubjects(res.data))
      .catch(err => console.error('Failed to fetch subjects', err))
  }, [])

  const loadSummary = () => {
    if (!selectedSubjectId) return
    const sub = subjects.find(s => s.subject_id === selectedSubjectId)
    if (!sub) return

    axios.get(`${API}/grades/summary/class/${sub.class_id}/subject/${sub.subject_id}`, { headers })
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load summary', err))
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📈 Overall Grades Summary</h1>

      <div className="mb-4">
        <label className="font-medium">Subject</label>
        <select
          className="w-full p-2 border rounded mt-1"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
        >
          <option value="">-- Choose --</option>
          {subjects.map(s => (
            <option key={s.subject_id} value={s.subject_id}>
              {s.class_name} - {s.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={loadSummary}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        📊 Load Summary
      </button>

      {summary.length > 0 ? (
        <table className="w-full bg-white shadow table-auto rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Student</th>
              <th className="text-left p-2">CAT 1 (50)</th>
              <th className="text-left p-2">CAT 2 (50)</th>
              <th className="text-left p-2">Main (100)</th>
              <th className="text-left p-2">Total Score</th>
              <th className="text-left p-2">KCSE Grade</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((r, i) => (
              <tr key={r.student_id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{r.student_name}</td>
                <td className="p-2">{r.cat1}</td>
                <td className="p-2">{r.cat2}</td>
                <td className="p-2">{r.main}</td>
                <td className="p-2 font-semibold">{r.total}</td>
                <td className="p-2">{r.kcse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No summary data. Be sure to select subject and load summary.</p>
      )}
    </div>
  )
}
