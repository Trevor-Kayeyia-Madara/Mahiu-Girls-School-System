import { useEffect, useState } from 'react'
import axios from 'axios'

interface ExamSchedule {
  id: number
  exam: { name: string; term: string; year: number }
  class_assignment: {
    subject: { name: string }
    classroom: { class_name: string }
  }
}

interface SummaryRow {
  student_id: number
  student_name: string
  marks: number
  kcse: string
}

const API = 'http://localhost:5001/api/v1'
const token = localStorage.getItem('token')
const headers = { Authorization: `Bearer ${token}` }

export default function SummaryBySchedule() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([])
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | ''>('')
  const [summary, setSummary] = useState<SummaryRow[]>([])

  useEffect(() => {
    axios.get(`${API}/exam-schedules`, { headers })
      .then(res => setSchedules(res.data))
      .catch(err => console.error('Error loading schedules', err))
  }, [])

  const loadSummary = () => {
    if (!selectedScheduleId) return

    axios.get(`${API}/grades/summary/schedule/${selectedScheduleId}`, { headers })
      .then(res => setSummary(res.data))
      .catch(err => console.error('Error loading summary', err))
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📘 Summary by Exam Schedule</h1>

      <div className="mb-4">
        <label className="font-medium">Select Exam Schedule</label>
        <select
          className="w-full p-2 border rounded mt-1"
          value={selectedScheduleId}
          onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
        >
          <option value="">-- Choose Exam Schedule --</option>
          {schedules.map(s => (
            <option key={s.id} value={s.id}>
              {s.exam.name} – {s.class_assignment.classroom.class_name} {s.class_assignment.subject.name} ({s.exam.term} {s.exam.year})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={loadSummary}
        className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded"
      >
        📊 Load Summary
      </button>

      {summary.length > 0 ? (
        <table className="w-full bg-white shadow table-auto rounded overflow-x-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Marks</th>
              <th className="p-2 text-left">KCSE Grade</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row, i) => (
              <tr key={row.student_id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{row.student_name}</td>
                <td className="p-2 font-semibold">{row.marks}</td>
                <td className="p-2">{row.kcse}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No summary data loaded yet.</p>
      )}
    </div>
  )
}
