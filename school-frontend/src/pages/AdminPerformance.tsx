/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminPerformance() {
  const [selectedYear, setSelectedYear] = useState(2024)
  const [selectedTerm, setSelectedTerm] = useState('Term 1')
  const [classData, setClassData] = useState([])
  const [subjectData, setSubjectData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/v1/performance/summary', {
        params: { year: selectedYear, term: selectedTerm }
      })
      setClassData(res.data.class_performance)
      setSubjectData(res.data.subject_performance)

      // Automatically load trend for the first class
      if (res.data.class_performance.length > 0) {
        const first = res.data.class_performance[0].class
        setSelectedClass(first)
        fetchTrend(first)
      }
    } catch (err) {
      console.error('Failed to fetch performance data', err)
    }
  }

  const fetchTrend = async (className: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/v1/performance/trends/${className}`)
      setTrendData(res.data)
    } catch (err) {
      console.error('Failed to fetch trend', err)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📈 Academic Performance Dashboard</h1>

      {/* 🔍 Filters */}
      <div className="flex gap-4 mb-8">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="border p-2 rounded"
        >
          {['Term 1', 'Term 2', 'Term 3'].map((term) => (
            <option key={term}>{term}</option>
          ))}
        </select>

        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Filter
        </button>
      </div>

      {/* 🏫 Class Performance */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">🏫 Class Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={classData}>
            <XAxis dataKey="class" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#3b82f6" name="Average Score" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 📘 Subject Performance */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">📘 Subject Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectData} layout="vertical">
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="subject" width={120} />
            <Tooltip />
            <Legend />
            <Bar dataKey="average" fill="#10b981" name="Average Score" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 📊 Trend Over Time */}
      {selectedClass && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">
            📊 Performance Trend for {selectedClass}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <XAxis dataKey={(d) => `${d.term} ${d.year}`} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#f59e0b" name="Trend" />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </AdminLayout>
  )
}
