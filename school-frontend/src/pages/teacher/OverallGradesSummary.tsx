import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
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

  const exportChart = async (type: 'image' | 'pdf') => {
    if (!chartRef.current) return
    const canvas = await html2canvas(chartRef.current)
    const imageData = canvas.toDataURL('image/png')

    if (type === 'image') {
      const link = document.createElement('a')
      link.href = imageData
      link.download = 'performance_chart.png'
      link.click()
    } else {
      const pdf = new jsPDF()
      const imgProps = pdf.getImageProperties(imageData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imageData, 'PNG', 0, 10, pdfWidth, pdfHeight)
      pdf.save('performance_chart.pdf')
    }
  }

  const average =
    summary.length > 0
      ? summary.reduce((sum, row) => sum + row.marks, 0) / summary.length
      : 0

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
        <>
          <table className="w-full bg-white shadow table-auto rounded mb-8">
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

          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={() => exportChart('image')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              🖼️ Export as Image
            </button>
            <button
              onClick={() => exportChart('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              📄 Export as PDF
            </button>
          </div>

          <div ref={chartRef}>
            <h2 className="text-lg font-semibold mb-2">📊 Performance Chart</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="student_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="marks" fill="#4f46e5" name="Marks" />
                <ReferenceLine y={average} label="Average" stroke="orange" strokeDasharray="3 3" />
              </BarChart>
            </ResponsiveContainer>

            <h2 className="text-lg font-semibold mt-8 mb-2">📈 Line Chart</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="student_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="marks" stroke="#10b981" name="Marks" />
                <ReferenceLine y={average} label="Average" stroke="orange" strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-gray-600">No summary data loaded yet.</p>
      )}
    </div>
  )
}
