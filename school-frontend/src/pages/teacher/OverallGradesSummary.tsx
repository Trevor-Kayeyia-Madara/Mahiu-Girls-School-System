import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Legend, PieChart, Pie, Cell
} from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    axios.get(`${API}/exam-schedules/me`, { headers })
      .then(res => setSchedules(res.data))
      .catch(err => console.error('Failed to load schedules', err))
  }, [])

  const loadSummary = () => {
    if (!selectedScheduleId) return
    axios.get(`${API}/grades/summary/schedule/${selectedScheduleId}`, { headers })
      .then(res => setSummary(res.data))
      .catch(err => console.error('Failed to load summary', err))
  }

  const exportAsImage = () => {
    if (!chartRef.current) return
    html2canvas(chartRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0)
      pdf.save('summary.pdf')
    })
  }

  const average =
    summary.reduce((acc, s) => acc + s.marks, 0) / (summary.length || 1)

  const gradeCounts = summary.reduce((acc, row) => {
    acc[row.kcse] = (acc[row.kcse] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const gradeData = Object.entries(gradeCounts).map(([grade, count]) => ({
    name: grade,
    value: count
  }))

  const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa']

  return (
    <div className="p-8 bg-gradient-to-tr from-gray-100 to-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Performance Summary by Exam</h1>

        <div className="mb-6 bg-white p-4 shadow rounded-xl">
          <label className="block font-medium text-gray-700 mb-2">Exam Schedule</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedScheduleId}
            onChange={(e) => setSelectedScheduleId(Number(e.target.value))}
          >
            <option value="">-- Select Exam Schedule --</option>
            {schedules.map(s => (
              <option key={s.id} value={s.id}>
                {s.exam.name} - {s.exam.term} {s.exam.year} - {s.class_assignment.classroom.class_name} {s.class_assignment.subject.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadSummary}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🔍 Load Summary
          </button>
        </div>

        {summary.length > 0 && (
          <div ref={chartRef} className="space-y-10">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📈 Student Scores (Bar)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="student_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={average} label="Avg" stroke="red" strokeDasharray="3 3" />
                  <Bar dataKey="marks" fill="#3b82f6" name="Marks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">📉 Student Scores (Line)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="student_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={average} label="Avg" stroke="red" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="marks" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">🥧 Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent ?? 0 * 100).toFixed(0)}%`}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {gradeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {summary.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={exportAsImage}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              📥 Export as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
