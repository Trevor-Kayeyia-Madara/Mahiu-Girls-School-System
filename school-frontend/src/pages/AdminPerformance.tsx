import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminPerformance() {
  const [classData, setClassData] = useState([])
  const [subjectData, setSubjectData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get('http://localhost:5001/api/v1/performance/summary')
      setClassData(res.data.class_performance)
      setSubjectData(res.data.subject_performance)
    }
    fetchData()
  }, [])

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">📈 Academic Performance Dashboard</h1>

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

      <section>
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
    </AdminLayout>
  )
}
